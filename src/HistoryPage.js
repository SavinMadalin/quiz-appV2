// src/HistoryPage.js
import { useEffect, useState, useMemo } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore"; // Import getDoc
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import TopNavbar from "./components/TopNavbar";

// Import the new components
import HistoryTable from "./components/HistoryTable";
import HistoryChart from "./components/HistoryChart";
import CategoryFilter from "./components/CategoryFilter";
import HistoryTabs from "./components/HistoryTabs";
import FeedbackPopup from "./components/FeedbackPopup";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, isEmailVerified } = useSelector(
    (state) => state.user
  );
  const [selectedCategory, setSelectedCategory] = useState("backend-engineer"); // Default category
  const [categories, setCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState("custom"); // 'custom' or 'interview'
  const [selectedFeedback, setSelectedFeedback] = useState(null); // New state for selected feedback

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !user.uid) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const q = query(
          collection(db, "results"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setHistory(results);
        // Get the unique categories
        const uniqueCategories = [
          ...new Set(results.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching history:", error);
        setFetchError("Failed to load quiz history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.uid]); // <-- Changed dependency array to [user?.uid]

  const handleSeeFeedback = async (result) => {
    if (result.feedback) {
      // If feedback is already in the result object, use it
      setSelectedFeedback(result.feedback);
    } else {
      // Otherwise, fetch it from the database
      try {
        const docRef = doc(db, "results", result.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedFeedback(data.feedback || "No feedback available.");
        } else {
          setSelectedFeedback("No feedback available.");
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setSelectedFeedback("Error fetching feedback.");
      }
    }
  };

  const handleCloseFeedback = () => {
    setSelectedFeedback(null);
  };

  // Filter data for the chart and the table
  const filteredHistory = useMemo(() => {
    let filtered =
      activeTab === "interview"
        ? history.filter((result) => result.quizType === "interview")
        : history.filter((result) => result.quizType === "custom");

    // If not authenticated or not verified, filter out interview mode results
    if (!isAuthenticated || !isEmailVerified) {
      filtered = filtered.filter((result) => result.quizType === "custom");
    }
    return filtered;
  }, [history, activeTab, isAuthenticated, isEmailVerified]);

  // Filter data for the chart
  const chartData = filteredHistory
    .filter((item) => item.category === selectedCategory)
    .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
    .map((item, index) => ({
      name: new Date(item.timestamp.seconds * 1000).toLocaleDateString(),
      score: item.score,
      key: index,
    }));

  // Filter the data to get only the last 10 results.
  const lastTenResults = filteredHistory.slice(0, 100);

  // Function to sort data
  const getSortValue = (item, key) => {
    // Determine the number of questions based on quiz type
    const numQuestions = item.quizType === "interview" ? 15 : 10;
    switch (key) {
      case "date":
        return item.timestamp.seconds;
      case "category":
        return item.category.toLowerCase();
      case "time":
        return item.quizType === "interview"
          ? item.timeTaken
          : item.timePerQuestion !== undefined
          ? item.timePerQuestion
          : "0";
      case "percentage":
        return item.score / numQuestions; // Use numQuestions here
      case "status":
        return item.score / numQuestions >=
          (item.quizType === "interview" ? 0.66 : 0.8)
          ? 1
          : 0; // Use numQuestions here and the correct percentage
      default:
        return 0;
    }
  };

  const sortedHistory = useMemo(() => {
    if (!sortConfig.key) {
      return lastTenResults;
    }
    return [...lastTenResults].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      return sortConfig.direction === "ascending"
        ? aValue > bValue
          ? 1
          : aValue < bValue
          ? -1
          : 0
        : aValue < bValue
        ? 1
        : aValue > bValue
        ? -1
        : 0;
    });
  }, [lastTenResults, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white pt-12 pb-20 lg:pl-28">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-6 rounded-lg shadow-lg max-w-4xl w-11/12 md:w-10/12 mt-8 mb-12">
        {/* Changed w-10/12 to w-11/12 md:w-10/12 */}
        {fetchError && <p className="text-red-500 text-center">{fetchError}</p>}
        {isLoading ? (
          <div className="flex justify-center">
            <div className="bg-white dark:bg-dark-grey p-6 rounded-lg shadow-lg w-full h-full flex justify-center items-center">
              <Spinner />
            </div>
          </div>
        ) : (
          <>
            {!isAuthenticated ? (
              <p className="text-center">
                No history available, you have to log in to enable this feature.
              </p>
            ) : history.length === 0 ? (
              <p className="text-center">No quiz history available.</p>
            ) : (
              <>
                {/* Tabs */}
                <HistoryTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />

                {/* Sorting and History Table */}
                <HistoryTable
                  sortedHistory={sortedHistory}
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                  handleSeeFeedback={handleSeeFeedback} // Pass handleSeeFeedback
                />

                {/* Chart Box */}
                <div className="mt-2 p-1 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
                  {/* Category Buttons */}
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    handleCategoryClick={handleCategoryClick}
                  />
                  {/* Chart */}
                  <HistoryChart
                    chartData={chartData}
                    selectedCategory={selectedCategory}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
      {/* Feedback Popup */}
      {selectedFeedback && (
        <FeedbackPopup
          feedback={selectedFeedback}
          onClose={handleCloseFeedback}
        />
      )}
    </div>
  );
};

export default HistoryPage;
