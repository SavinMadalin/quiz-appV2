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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState("custom"); // 'custom' or 'interview'
  const [selectedFeedback, setSelectedFeedback] = useState(null);

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

        const uniqueCategories = [
          ...new Set(results.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);

        if (uniqueCategories.length > 0) {
          if (uniqueCategories.length === 1) {
            setSelectedCategory(uniqueCategories[0]);
          } else {
            const randomIndex = Math.floor(
              Math.random() * uniqueCategories.length
            );
            setSelectedCategory(uniqueCategories[randomIndex]);
          }
        } else {
          setSelectedCategory(null);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setFetchError("Failed to load quiz history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.uid]);

  const handleSeeFeedback = async (result) => {
    if (result.feedback) {
      setSelectedFeedback(result.feedback);
    } else {
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

  const filteredHistory = useMemo(() => {
    let filtered =
      activeTab === "interview"
        ? history.filter((result) => result.quizType === "interview")
        : history.filter((result) => result.quizType === "custom");

    if (!isAuthenticated || !isEmailVerified) {
      filtered = filtered.filter((result) => result.quizType === "custom");
    }
    return filtered;
  }, [history, activeTab, isAuthenticated, isEmailVerified]);

  const chartData = useMemo(() => {
    if (!selectedCategory) return [];
    return filteredHistory
      .filter((item) => item.category === selectedCategory)
      .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
      .map((item, index) => ({
        name: new Date(item.timestamp.seconds * 1000).toLocaleDateString(),
        score: item.score,
        key: index,
      }));
  }, [filteredHistory, selectedCategory]);

  const limitedHistory = useMemo(
    () => filteredHistory.slice(0, 100),
    [filteredHistory]
  );

  const getSortValue = (item, key) => {
    const numQuestions =
      item.quizType === "interview"
        ? 15 // Use constant MOCK_INTERVIEW_QUESTIONS
        : 10; // Use constant CUSTOM_QUIZ_QUESTIONS
    switch (key) {
      case "date":
        return item.timestamp.seconds;
      case "category":
        return item.category.toLowerCase();
      case "time":
        return item.quizType === "interview"
          ? item.timeTaken
          : item.timePerQuestion !== undefined
          ? parseInt(item.timePerQuestion, 10)
          : 0;
      case "percentage":
        return item.score / numQuestions;
      case "status":
        return item.score / numQuestions >=
          (item.quizType === "interview" ? 0.66 : 0.8)
          ? 1
          : 0;
      default:
        return 0;
    }
  };

  const sortedHistory = useMemo(() => {
    if (!sortConfig.key) {
      return limitedHistory;
    }
    return [...limitedHistory].sort((a, b) => {
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
  }, [limitedHistory, sortConfig]);

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
    // Main page container
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:pt-8">
      <TopNavbar />
      <Navbar />

      {/* Content Area */}
      <div className="max-w-4xl w-full mt-4 mb-8">
        {fetchError && <p className="text-red-500 text-center">{fetchError}</p>}
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="bg-white dark:bg-dark-grey p-4 rounded-lg shadow-lg flex justify-center items-center">
              <Spinner />
            </div>
          </div>
        ) : (
          <>
            {!isAuthenticated ? (
              <div className="bg-white dark:bg-dark-grey p-4 rounded-lg shadow-lg text-center text-sm sm:text-base mt-4">
                No history available, you have to log in to enable this feature.
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white dark:bg-dark-grey p-4 rounded-lg shadow-lg text-center text-sm sm:text-base mt-4">
                No quiz history available.
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="mb-4 lg:mt-4 lg:mb-6">
                  {" "}
                  {/* Changed lg:mb-6 */}
                  <HistoryTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>

                {/* Sorting and History Table - Re-added the wrapper div */}
                <div className="bg-white dark:bg-dark-grey p-4 rounded-lg shadow-lg mb-4">
                  <HistoryTable
                    sortedHistory={sortedHistory}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    handleSeeFeedback={handleSeeFeedback}
                  />
                </div>

                {/* Chart Box */}
                {categories.length > 0 && selectedCategory && (
                  <div className="bg-white dark:bg-dark-grey p-4 rounded-lg shadow-lg mt-4">
                    <CategoryFilter
                      categories={categories}
                      selectedCategory={selectedCategory}
                      handleCategoryClick={handleCategoryClick}
                    />
                    <HistoryChart
                      chartData={chartData}
                      selectedCategory={selectedCategory}
                    />
                  </div>
                )}
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
