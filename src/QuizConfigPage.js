import { useDispatch, useSelector } from "react-redux";
import { setQuizConfig, incrementDailyAttempts } from "./redux/quizSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import {
  ClockIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";

const QuizConfigPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizConfig } = useSelector((state) => state.quiz);
  const { isAuthenticated, isEmailVerified } = useSelector(
    (state) => state.user
  );
  const { dailyAttempts } = useSelector((state) => state.quiz.quizConfig);
  const [draftSettings, setDraftSettings] = useState(quizConfig);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState(null);
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(true);
  const [activeTab, setActiveTab] = useState("custom");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const timeDropdownRef = useRef(null);

  const mainCategories = [
    {
      value: "backend-engineer",
      label: "Backend Engineer",
      subcategories: ["java", "python", "sql", "spring"],
    },
    {
      value: "frontend-engineer",
      label: "Frontend Engineer",
      subcategories: ["javascript", "typescript", "react", "angular"],
    },
    {
      value: "devops-engineer",
      label: "DevOps Engineer",
      subcategories: ["docker", "kubernetes", "aws", "azure", "gcp"],
    },
    { value: "ai", label: "AI", subcategories: ["ai"] },
  ];

  const timeOptions = [
    { value: "1", label: "1 minute" },
    { value: "2", label: "2 minutes" },
    { value: "0", label: "No time" },
  ];

  useEffect(() => {
    setSelectedSubcategories([]);
    setDraftSettings(quizConfig);
    const selectedMainCategory = mainCategories.find(
      (cat) => cat.value === quizConfig.category
    );
    if (selectedMainCategory) {
      setSubcategories(selectedMainCategory.subcategories);
    } else {
      const backendCategory = mainCategories.find(
        (cat) => cat.value === "backend-engineer"
      );
      if (backendCategory) {
        setSubcategories(backendCategory.subcategories);
        setDraftSettings({ ...draftSettings, category: "backend-engineer" });
      } else {
        setSubcategories([]);
      }
    }
    setError(null);
  }, [quizConfig]);

  useEffect(() => {
    if (draftSettings.category === "ai") {
      setIsStartButtonDisabled(false);
    } else {
      setIsStartButtonDisabled(selectedSubcategories.length === 0);
    }
  }, [selectedSubcategories, draftSettings]);

  const handleChange = (name, value) => {
    setDraftSettings({ ...draftSettings, [name]: value });

    if (name === "category") {
      const selectedMainCategory = mainCategories.find(
        (cat) => cat.value === value
      );
      if (selectedMainCategory) {
        setSubcategories(selectedMainCategory.subcategories);
        setSelectedSubcategories([]);
        setError(null);
      } else {
        setSubcategories([]);
        setSelectedSubcategories([]);
        setError(null);
      }
      setIsCategoryDropdownOpen(false);
    }
    if (name === "timePerQuestion") {
      setIsTimeDropdownOpen(false);
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategories((prev) => {
      if (prev.includes(subcategory)) {
        return prev.filter((sub) => sub !== subcategory);
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
      isMockInterviewMode: activeTab === "interview",
      timePerQuestion:
        activeTab === "interview" ? 1 : draftSettings.timePerQuestion,
    };
    dispatch(setQuizConfig(config));
    dispatch(incrementDailyAttempts());
    navigate("/quiz");
  };

  const getCategoryIcon = () => {
    return (
      <CpuChipIcon className="h-6 w-6 text-purple-500 dark:text-purple-400" />
    );
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const toggleTimeDropdown = () => {
    setIsTimeDropdownOpen(!isTimeDropdownOpen);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target)
      ) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-blue-500 dark:bg-dark-blue-matte text-light-text dark:text-white pt-24 overflow-hidden">
      <TopNavbar />
      <div className="fixed bottom-4 w-full z-40">
        <Navbar />
      </div>
      <div className="bg-white dark:bg-dark-grey p-7 rounded-lg shadow-lg max-w-md w-full mt-8">
        <h1 className="text-xl font-bold mb-2 text-center flex items-center justify-center gap-2">
          <Cog6ToothIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          Configuration
        </h1>

        <div className="mb-4 border-b border-gray-300 dark:border-gray-600">
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab("custom")}
              className={`w-1/2 py-3 focus:outline-none text-base ${
                activeTab === "custom"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="block text-center">Custom Mode</span>
            </button>
            <div className="w-1/2 relative group">
              <button
                onClick={() => {
                  if (isAuthenticated && isEmailVerified) {
                    setActiveTab("interview");
                  }
                }}
                disabled={!isAuthenticated || !isEmailVerified}
                className={`w-full py-3 focus:outline-none text-base ${
                  activeTab === "interview"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-700 dark:text-gray-300"
                } ${
                  !isAuthenticated || !isEmailVerified
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="block text-center">Interview Mode</span>
              </button>
              {(!isAuthenticated || !isEmailVerified) && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-full bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                  This mode is available only for the users with a verified
                  account
                </span>
              )}
            </div>
          </div>
        </div>

        {activeTab === "custom" && (
          <div>
            <p className="mb-4 text-base text-gray-600 dark:text-gray-400">
              Customize your quiz by selecting categories, subcategories, and
              the time per question. The quiz will have 10 questions.
            </p>
            <div className="mb-4" ref={categoryDropdownRef}>
              <label
                htmlFor="category"
                className="block font-medium mb-2 flex items-center gap-2 text-base"
              >
                {getCategoryIcon()}
                Category:
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleCategoryDropdown}
                  className="mt-1 p-2 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between cursor-pointer text-base"
                >
                  {mainCategories.find(
                    (cat) => cat.value === draftSettings.category
                  )?.label || "Select Category"}
                  {isCategoryDropdownOpen ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {mainCategories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => handleChange("category", cat.value)}
                          disabled={
                            (!isAuthenticated || !isEmailVerified) &&
                            cat.value !== "backend-engineer"
                          }
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            (!isAuthenticated || !isEmailVerified) &&
                            cat.value !== "backend-engineer"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          } border-b border-gray-300 dark:border-gray-600 last:border-b-0`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Tooltip */}
              {(!isAuthenticated || !isEmailVerified) && (
                <p className="text-xs text-red-500 dark:text-red-300 mt-1">
                  Only the Backend Engineer category is available for
                  unauthenticated or unverified users.
                </p>
              )}
            </div>

            {draftSettings.category !== "ai" && (
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <label className="block font-medium mb-2 text-base">
                    Subcategories (multiple selection):
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubcategoryChange(sub)}
                      className={`flex items-center justify-center border rounded-md p-2 text-sm ${
                        selectedSubcategories.includes(sub)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {sub
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8" ref={timeDropdownRef}>
              <label
                htmlFor="timePerQuestion"
                className="block font-medium mb-2 flex items-center gap-2 text-base"
              >
                <ClockIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 animate-pulse" />
                Time Per Question:
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleTimeDropdown}
                  className="mt-1 p-2 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between cursor-pointer text-base"
                >
                  {timeOptions.find(
                    (option) => option.value === draftSettings.timePerQuestion
                  )?.label || "1 minute"}
                  {isTimeDropdownOpen ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
                {isTimeDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {timeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleChange("timePerQuestion", option.value)
                          }
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-b border-gray-300 dark:border-gray-600 last:border-b-0"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {draftSettings.timePerQuestion === "0"
                  ? "You will have unlimited time for each question."
                  : `You will have ${draftSettings.timePerQuestion} minute(s) per question.`}
              </p>
            </div>
          </div>
        )}

        {activeTab === "interview" && (
          <div>
            <p className="mb-4 text-base text-gray-600 dark:text-gray-400">
              Prepare for your interview with this mode. The quiz will have 15
              questions and 20 minutes per quiz.
            </p>
            <div className="mb-6" ref={categoryDropdownRef}>
              <label
                htmlFor="category"
                className="block font-medium mb-2 flex items-center gap-2 text-base"
              >
                {getCategoryIcon()}
                Category:
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleCategoryDropdown}
                  className="mt-1 p-2 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between cursor-pointer text-base"
                >
                  {mainCategories.find(
                    (cat) => cat.value === draftSettings.category
                  )?.label || "Select Category"}
                  {isCategoryDropdownOpen ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {mainCategories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => handleChange("category", cat.value)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-b border-gray-300 dark:border-gray-600 last:border-b-0"
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {draftSettings.category !== "ai" && (
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <label className="block font-medium mb-2 text-base">
                    Subcategories:
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  (you can select multiple subcategories)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubcategoryChange(sub)}
                      className={`flex items-center justify-center border rounded-md p-2 text-sm ${
                        selectedSubcategories.includes(sub)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {sub
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && <div className="text-red-500 mb-2">{error}</div>}

        <div className="relative group">
          <button
            onClick={handleApply}
            disabled={isStartButtonDisabled}
            className={`w-full bg-green-500 ${
              isStartButtonDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-600"
            } text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 block text-center text-base`}
          >
            Start
          </button>
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
