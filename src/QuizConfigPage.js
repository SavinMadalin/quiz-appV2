// src/QuizConfigPage.js
import { useDispatch, useSelector } from 'react-redux';
import { setQuizConfig } from './redux/quizSlice';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import TopNavbar from './components/TopNavbar';
import { ClockIcon, CpuChipIcon, PresentationChartLineIcon, Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

const QuizConfigPage = () => {
  const dispatch = useDispatch();
  const quizConfig = useSelector((state) => state.quiz.quizConfig);
  const [draftSettings, setDraftSettings] = useState(quizConfig);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState(null);
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(true);
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' or 'interview'

  const mainCategories = [
    { value: 'backend-engineer', label: 'Backend Engineer', subcategories: ['java', 'python', 'sql', 'spring'] },
    { value: 'frontend-engineer', label: 'Frontend Engineer', subcategories: ['javascript', 'typescript', 'react', 'angular'] },
    { value: 'devops-engineer', label: 'DevOps Engineer', subcategories: ['docker', 'kubernetes', 'aws', 'azure', 'gcp'] },
    { value: 'cloud-engineer', label: 'Cloud Engineer', subcategories: ['aws', 'azure', 'google-cloud'] },
    { value: 'ai', label: 'AI', subcategories: ['ai'] },
  ];

  useEffect(() => {
    setSelectedSubcategories([]);
    setDraftSettings(quizConfig);
    const selectedMainCategory = mainCategories.find(cat => cat.value === quizConfig.category);
    if (selectedMainCategory) {
      setSubcategories(selectedMainCategory.subcategories);
    } else {
      const backendCategory = mainCategories.find(cat => cat.value === 'backend-engineer');
      if (backendCategory) {
        setSubcategories(backendCategory.subcategories);
        setDraftSettings({ ...draftSettings, category: 'backend-engineer' });
      } else {
        setSubcategories([]);
      }
    }
    setError(null);
  }, [quizConfig]);

  useEffect(() => {
    if (draftSettings.category === 'ai') {
      setIsStartButtonDisabled(false);
    } else {
      setIsStartButtonDisabled(selectedSubcategories.length === 0);
    }
  }, [selectedSubcategories, draftSettings.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraftSettings({ ...draftSettings, [name]: value });

    if (name === 'category') {
      const selectedMainCategory = mainCategories.find(cat => cat.value === value);
      if (selectedMainCategory) {
        setSubcategories(selectedMainCategory.subcategories);
        setSelectedSubcategories([]);
        setError(null);
      } else {
        setSubcategories([]);
        setSelectedSubcategories([]);
        setError(null);
      }
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategory)) {
        return prev.filter(sub => sub !== subcategory);
      } else {
        return [...prev, subcategory];
      }
    });
    setError(null);
  };

  const handleApply = () => {
    const config = {
      ...draftSettings,
      subcategories: selectedSubcategories,
      isMockInterviewMode: activeTab === 'interview',
      timePerQuestion: activeTab === 'interview' ? 1 : draftSettings.timePerQuestion,
    };
    dispatch(setQuizConfig(config));
    setError(null);
  };

  const getCategoryIcon = () => {
    return <CpuChipIcon className="h-6 w-6 text-purple-500 dark:text-purple-400" />;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white pt-20">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full mt-10"> {/* Adjusted mt-10 */}
        <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
          <Cog6ToothIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          Configuration
        </h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300 dark:border-gray-600"> {/* Tab Bar */}
          <div className="flex w-full"> {/* Full-Width Flex Container */}
            <button
              onClick={() => setActiveTab('custom')}
              className={`w-1/2 py-3 focus:outline-none ${activeTab === 'custom' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <span className="block text-center">Custom Mode</span> {/* Centered Text */}
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`w-1/2 py-3 focus:outline-none ${activeTab === 'interview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <span className="block text-center">Interview Mode</span> {/* Centered Text */}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'custom' && (
          <div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Customize your quiz by selecting categories, subcategories, and the time per question. The quiz will have 10 questions.
            </p>
            {/* Category Selection */}
            <div className="mb-6">
              <label htmlFor="category" className="block font-medium mb-2 flex items-center gap-2">
                {getCategoryIcon()}
                Category:
              </label>
              <div className="relative"> {/* Dropdown Wrapper */}
                <select
                  id="category"
                  name="category"
                  value={draftSettings.category}
                  onChange={handleChange}
                  className="mt-1 p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {mainCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300"> {/* Dropdown Arrow */}
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Subcategory Selection */}
            {draftSettings.category !== 'ai' && (
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <label className="block font-medium mb-2">Subcategories (multiple selection):</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubcategoryChange(sub)}
                      className={`flex items-center justify-center border rounded-md p-2 ${
                        selectedSubcategories.includes(sub)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time Per Question */}
            <div className="mb-8">
              <label htmlFor="timePerQuestion" className="block font-medium mb-2 flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-blue-500 dark:text-blue-400 animate-pulse" />
                Time Per Question:
              </label>
              <div className="relative"> {/* Dropdown Wrapper */}
                <select
                  id="timePerQuestion"
                  name="timePerQuestion"
                  value={draftSettings.timePerQuestion}
                  onChange={handleChange}
                  className="mt-1 p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="1">1 minute</option>
                  <option value="2">2 minutes</option>
                  <option value="0">No time</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300"> {/* Dropdown Arrow */}
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {draftSettings.timePerQuestion === "0"
                  ? "You will have unlimited time for each question."
                  : `You will have ${draftSettings.timePerQuestion} minute(s) per question.`}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'interview' && (
          <div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Prepare for your interview with this mode. The quiz will have 15 questions and 20 minutes per quiz.
            </p>
            {/* Category Selection */}
            <div className="mb-6">
              <label htmlFor="category" className="block font-medium mb-2 flex items-center gap-2">
                {getCategoryIcon()}
                Category:
              </label>
              <div className="relative"> {/* Dropdown Wrapper */}
                <select
                  id="category"
                  name="category"
                  value={draftSettings.category}
                  onChange={handleChange}
                  className="mt-1 p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {mainCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300"> {/* Dropdown Arrow */}
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Subcategory Selection */}
            {draftSettings.category !== 'ai' && (
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <label className="block font-medium mb-2">Subcategories:</label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">(you can select multiple subcategories)</p>
                <div className="grid grid-cols-2 gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubcategoryChange(sub)}
                      className={`flex items-center justify-center border rounded-md p-2 ${
                        selectedSubcategories.includes(sub)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Start Quiz Button */}
        <div className="relative group">
          <Link
            to={isStartButtonDisabled ? '#' : "/quiz"}
            onClick={handleApply}
            className={`w-full bg-green-500 ${isStartButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'} text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 block text-center`}
          >
            Start
          </Link>
          {isStartButtonDisabled && (
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
              At least one subcategory has to be selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizConfigPage;
