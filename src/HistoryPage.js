// src/HistoryPage.js
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Spinner from './Spinner';
import { CalendarIcon, ChartPieIcon, ClockIcon, CpuChipIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'; // Import icons
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.user);
  const [selectedCategory, setSelectedCategory] = useState('java'); // Default category
  const [categories, setCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !user.uid) return;
      setIsLoading(true);
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
        console.error("Error fetching history:", error)
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Filter data for the chart
  const chartData = history
    .filter(item => item.category === selectedCategory)
    .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
    .map((item, index) => ({
      name: new Date(item.timestamp.seconds * 1000).toLocaleDateString(),
      score: item.score,
      key: index
    }));

  // Filter the data to get only the last 10 results.
  const lastTenResults = history.slice(0, 10);

  // Function to sort data
  const sortedHistory = () => {
    if (!sortConfig.key) {
      return lastTenResults;
    }
    return [...lastTenResults].sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === 'date') {
        aValue = a.timestamp.seconds;
        bValue = b.timestamp.seconds;
      } else if (sortConfig.key === 'category') {
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
      } else if (sortConfig.key === 'time') { // Changed to 'time'
        aValue = a.timePerQuestion !== undefined ? a.timePerQuestion : '0';
        bValue = b.timePerQuestion !== undefined ? b.timePerQuestion : '0';
      } else if (sortConfig.key === 'percentage') {
        aValue = (a.score / 10);
        bValue = (b.score / 10);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getCategoryIcon = () => {
    return <CpuChipIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
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

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white pt-20">
    <Navbar />
      <div className="bg-white dark:bg-dark-grey p-6 rounded-lg shadow-lg max-w-4xl w-10/12 mt-12 mb-12">
        <div className="flex items-center gap-2 mb-3">
          <ClockIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          <h2 className="text-lg font-bold">History</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center"><Spinner /></div>
        ) : (
          <>
            {!isAuthenticated ? (
              <p className="text-center">No history available, you have to log in to enable this feature.</p>
            ) : history.length === 0 ? (
              <p className="text-center">No quiz history available.</p>
            ) : (
          <>
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
            <div className="mb-4 p-2 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 max-h-[350px] overflow-y-auto">
              <div className="flex flex-col gap-2 mt-2">
                {sortedHistory().map((result, index) => {
                  const percentage = ((result.score / 10) * 100).toFixed(0);
                  const isPassed = percentage >= 80;
                  const isEven = index % 2 === 0;
                  const category = result.category || 'java';
                  const timePerQuestion = result.timePerQuestion !== undefined ? result.timePerQuestion : '0';

                  return (
                    <div
                      key={result.id}
                      className={`bg-white dark:bg-gray-700 p-0 rounded-lg shadow-md grid grid-cols-12 w-full items-center ${isEven ? 'bg-gray-50 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}
                      style={{ minHeight: '50px' }}
                    >
                      {/* Date */}
                      <div className="col-span-3 flex items-center">
                        <CalendarIcon className="h-5 w-5 text-pink-500 dark:text-pink-400 mr-1" />
                        <span className="font-medium text-xs">{new Date(result.timestamp.seconds * 1000).toLocaleDateString()}</span>
                      </div>

                      {/* Category */}
                      <div className="col-span-3 flex items-center">
                        <CpuChipIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-1" />
                        <span className="font-medium text-xs capitalize">{category}</span>
                      </div>

                      {/* Time Per Question */}
                      <div className="col-span-2 flex items-center ">
                        <ClockIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-1" />
                        <span className="font-medium text-xs capitalize">{timePerQuestionText(timePerQuestion)}</span>
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
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              {chartData.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold mb-1">{`Evolution of Results in ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}</h3>
                  <LineChart width={600} height={250} data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </>
              )}
              {chartData.length === 0 && (
                <p>No data for this category</p>
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
