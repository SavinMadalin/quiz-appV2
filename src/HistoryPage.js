import { useEffect, useState, useMemo } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Spinner from './Spinner';
import TopNavbar from './components/TopNavbar';
import { CalendarIcon, ChartPieIcon, ClockIcon, CpuChipIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Import icons
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.user);
  const [selectedCategory, setSelectedCategory] = useState('backend-engineer'); // Default category
  const [categories, setCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [fetchError, setFetchError] = useState(null); // New state for error messages
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' or 'interview'
  const [selectedFeedback, setSelectedFeedback] = useState(null); // New state for selected feedback

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !user.uid) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const q = query(
          collection(db, 'results'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setHistory(results);
        // Get the unique categories
        const uniqueCategories = [...new Set(results.map(item => item.category))];
        setCategories(uniqueCategories);

      } catch (error) {
        console.error("Error fetching history:", error);
        setFetchError("Failed to load quiz history. Please try again later."); // Set error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  
  const handleSeeFeedback = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleCloseFeedback = () => {
    setSelectedFeedback(null);
  };

  // Filter data for the chart and the table
  const filteredHistory = useMemo(() => {
    return activeTab === 'interview'
      ? history.filter(result => result.quizType === 'interview')
      : history.filter(result => result.quizType === 'custom');
  }, [history, activeTab]);

  // Filter data for the chart
  const chartData = filteredHistory
    .filter(item => item.category === selectedCategory)
    .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
    .map((item, index) => ({
      name: new Date(item.timestamp.seconds * 1000).toLocaleDateString(),
      score: item.score,
      key: index
    }));

  // Filter the data to get only the last 10 results.
  const lastTenResults = filteredHistory.slice(0, 10);

  // Function to sort data
  const getSortValue = (item, key) => {
    switch (key) {
      case 'date':
        return item.timestamp.seconds;
      case 'category':
        return item.category.toLowerCase();
      case 'time':
        return item.quizType === 'interview' ? item.timeTaken : item.timePerQuestion !== undefined ? item.timePerQuestion : '0';
      case 'percentage':
        return (item.score / 10);
      case 'status':
        return (item.score / 10) >= 8 ? 1 : 0; // 1 for passed, 0 for failed
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

      return sortConfig.direction === 'ascending'
        ? aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        : aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });
  }, [lastTenResults, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const getSortIcon = (key) => {
    // Check if the current sortConfig.key is the same as the key being checked
    if (sortConfig.key !== key) {
      return null; // Return null if not the active sorting key
    }

    return sortConfig.direction === 'ascending' ? (
      <ArrowUpIcon className="h-4 w-4 text-gray-500 ml-0.5" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-gray-500 ml-0.5" />
    );
  };

  const timePerQuestionText = (time) => {
    if (time === '0') {
      return 'No time';
    } else {
      return `${time} min/Q`;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getIcon = (key, result) => {
    switch (key) {
      case 'date':
        return <CalendarIcon className="h-5 w-5 text-pink-500 dark:text-pink-400 mr-1" />;
      case 'category':
        return <CpuChipIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-1" />;
      case 'time':
        return <ClockIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-1" />;
      default:
        return null;
    }
  };

  const getText = (key, result) => {
    switch (key) {
      case 'date':
        return new Date(result.timestamp.seconds * 1000).toLocaleDateString();
      case 'category':
        return result.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      case 'time':
        return result.quizType === 'interview' ? formatTime(result.timeTaken) : timePerQuestionText(result.timePerQuestion !== undefined ? result.timePerQuestion : '0');
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white pt-20">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-6 rounded-lg shadow-lg max-w-4xl w-10/12 mt-9 mb-12">
        {fetchError && <p className="text-red-500 text-center">{fetchError}</p>}
        {isLoading ? (
          <div className="flex justify-center">
            <div className="bg-white dark:bg-dark-grey p-6 rounded-lg shadow-lg w-full h-full flex justify-center items-center"><Spinner /></div>
          </div>
        ) : (
          <>
            {!isAuthenticated ? (
              <p className="text-center">No history available, you have to log in to enable this feature.</p>
            ) : history.length === 0 ? (
              <p className="text-center">No quiz history available.</p>
            ) : (
              <>
                {/* Tabs */}
                <div className="mb-6 border-b border-gray-300 dark:border-gray-600">
                  <div className="flex w-full">
                    <button
                      onClick={() => setActiveTab('custom')}
                      className={`w-1/2 py-3 focus:outline-none ${activeTab === 'custom' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <span className="block text-center">Custom Quizzes</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('interview')}
                      className={`w-1/2 py-3 focus:outline-none ${activeTab === 'interview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <span className="block text-center">Interview Mode</span>
                    </button>
                  </div>
                </div>
                {/* Sorting Buttons */}
                <div className="grid grid-cols-12 w-full items-center mb-2 text-sm">
                  <button className="col-span-3 font-semibold flex items-center justify-left pr-5" onClick={() => requestSort('date')}>
                    <span className="">Date</span> {getSortIcon('date')} {/* Pass 'date' as the key */}
                  </button>
                  <button className="col-span-3 font-semibold flex items-center" onClick={() => requestSort('category')}>
                    <span className="">Category</span> {getSortIcon('category')} {/* Pass 'category' as the key */}
                  </button>
                  <button className="col-span-1 font-semibold flex items-center justify-center" onClick={() => requestSort('time')}>
                    <span className="">Time</span> {getSortIcon('time')} {/* Pass 'time' as the key */}
                  </button>
                  <button className="col-span-4 font-semibold flex items-center justify-center pr-2" onClick={() => requestSort('percentage')}>
                    <span className="">Percentage</span> {getSortIcon('percentage')} {/* Pass 'percentage' as the key */}
                  </button>
                  <button className="col-span-0 font-semibold flex items-center justify-end pr-2" onClick={() => requestSort('status')}>
                    <span className="">Status</span> {getSortIcon('status')} {/* Pass 'status' as the key */}
                  </button>
                </div>
                {/* History List Box */}
                <div className="mb-4 p-2 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 max-h-[300px] overflow-y-auto"> {/* Fixed height and overflow */}
                  <div className="flex flex-col gap-2 mt-2">
                    {sortedHistory.map((result, index) => {
                      const percentage = ((result.score / 10) * 100).toFixed(0);
                      const isPassed = percentage >= 80;
                      const isEven = index % 2 === 0;
                      const sortConfig = { key: 'date' };

                      return (
                        <div
                          key={result.id}
                          className={`bg-white dark:bg-gray-700 p-0 rounded-lg shadow-md grid grid-cols-12 w-full items-center ${isEven ? 'bg-gray-50 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'} min-h-[50px]`}>
                          {/* Date */}
                          <div className="col-span-3 flex items-center">
                            {getIcon(sortConfig.key, result)}
                            <span className="font-medium text-xs">{getText(sortConfig.key, result)}</span>
                          </div>

                          {/* Category */}
                          <div className="col-span-3 flex items-center">
                            {getIcon('category', result)}
                            <span className="font-medium text-xs">{getText('category', result)}</span>
                          </div>

                          {/* Time Per Question */}
                          <div className="col-span-2 flex items-center ">
                            {getIcon('time', result)}
                            <span className="font-medium text-xs">{getText('time', result)}</span>
                          </div>

                          {/* Result and status*/}
                          <div className="col-span-2 flex items-center justify-center pr-2">
                            <div className="flex items-center">
                              <ChartPieIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-1" />
                              <span className="font-medium text-xs">{percentage}%</span>
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center justify-end pl-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${isPassed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                            >
                              {isPassed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart Box */}
                <div className="mt-2 p-1 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
                  {/* Category Buttons */}
                  <div className="flex flex-wrap gap-2 mb-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`px-2 py-1 rounded-full text-xs ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                  {chartData.length === 0 ? (
                    <p>No data for this category</p>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold mb-1">{`Evolution of Results in ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}</h3>
                      <LineChart width={window.innerWidth < 768 ? 300 : 600} height={250} data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
