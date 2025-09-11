import { useDispatch, useSelector } from "react-redux";
import { setQuizConfig } from "./redux/quizSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import {
  ClockIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import classNames from "classnames"; // Import classNames
import { mainCategories } from "./constants"; // Import from constants.js
import Spinner from "./Spinner"; // Import Spinner
import { useSubscription } from "./contexts/SubscriptionContext"; // Import useSubscription

const QuizConfigPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizConfig } = useSelector((state) => state.quiz);
  const { isAuthenticated, isEmailVerified } = useSelector(
    (state) => state.user
  );
  // const { dailyAttempts } = useSelector((state) => state.quiz.quizConfig); // dailyAttempts seems unused
  const [draftSettings, setDraftSettings] = useState({
    ...quizConfig,
    category: "core-languages", // Default to core-languages
  });
  const {
    isPremium,
    isLoadingStatus: isLoadingSubscription,
    subscriptionStatus,
  } = useSubscription();

  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState(null);
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(true);
  const [activeTab, setActiveTab] = useState("custom");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const timeDropdownRef = useRef(null);

  const timeOptions = [
    { value: "1", label: "1 minute" },
    { value: "2", label: "2 minutes" },
    { value: "0", label: "No time" },
  ];

  // Helper to get the current category object
  const getCurrentCategory = (categoryValue) => {
    return mainCategories.find((cat) => cat.value === categoryValue);
  };

  // Initialize with default category and handle restrictions
  useEffect(() => {
    // Always default to 'core-languages'
    const initialCategoryValue = "core-languages";
    const initialCategory = getCurrentCategory(initialCategoryValue);

    setDraftSettings((prev) => ({
      ...prev, // Keep existing settings like time
      category: initialCategoryValue,
    }));
    setSubcategories(initialCategory?.subcategories || []);

    if (!isPremium) {
      setSelectedSubcategories(["java"]); // Default for free users
      setActiveTab("custom"); // Force custom mode
    } else {
      setSelectedSubcategories([]); // Reset for premium users
    }
    setError(null);
  }, [isAuthenticated, isEmailVerified, isPremium]); // Rerun if auth status changes

  const getDisplaySubcategoryName = (subcategoryValue) => {
    switch (subcategoryValue) {
      case "api-rest":
        return "Rest API";
      case "csharp":
        return "C#";
      case "django-flask":
        return "Django/Flask";
      case "html-css":
        return "HTML/CSS";
      case "ml-concepts":
        return "ML Concepts";
      case "python-ml":
        return "Python (ML)";
      case "deep-learning":
        return "Deep Learning";
      // Add more custom mappings here if needed
      default:
        // Default formatting: Capitalize first letter of each word, join with space
        return subcategoryValue
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    }
  };

  // Update start button disabled state
  useEffect(() => {
    if (!isPremium) {
      // Restricted: Enable only if 'core-languages' and 'java' are selected
      setIsStartButtonDisabled(
        !(
          draftSettings.category === "core-languages" &&
          selectedSubcategories.includes("java")
        )
      );
    } else {
      // Not restricted: Enable if category has no subs OR if at least one sub is selected
      const currentCategory = getCurrentCategory(draftSettings.category);
      const hasSubcategories = currentCategory?.subcategories?.length > 0;
      if (hasSubcategories) {
        setIsStartButtonDisabled(selectedSubcategories.length === 0);
      } else {
        setIsStartButtonDisabled(false);
      }
    }
  }, [selectedSubcategories, draftSettings.category, isPremium]);

  const handleChange = (name, value) => {
    // Allow changing category for all users
    const newDraftSettings = { ...draftSettings, [name]: value };
    setDraftSettings(newDraftSettings);

    if (name === "category") {
      const selectedMainCategory = getCurrentCategory(value);
      setSubcategories(selectedMainCategory?.subcategories || []);
      // Reset or enforce subcategory selection based on restriction
      if (!isPremium) {
        setSelectedSubcategories(["java"]);
      } else {
        setSelectedSubcategories([]);
      }
      setError(null);
      setIsCategoryDropdownOpen(false);
    }
    if (name === "timePerQuestion") {
      setIsTimeDropdownOpen(false);
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    // Prevent changing subcategory if restricted and it's not 'java'
    if (!isPremium && subcategory !== "java") {
      return;
    }

    setSelectedSubcategories((prev) => {
      // If restricted, only allow 'java' to be toggled (effectively, it stays selected)
      if (!isPremium) {
        return ["java"]; // Keep java selected
      }
      // Normal toggle logic for unrestricted users
      if (prev.includes(subcategory)) {
        return prev.filter((sub) => sub !== subcategory);
      } else {
        return [...prev, subcategory];
      }
    });
    setError(null);
  };

  const handleApply = () => {
    const currentCategory = getCurrentCategory(draftSettings.category);
    const hasSubcategories = currentCategory?.subcategories?.length > 0;

    // Ensure correct subcategories are passed based on restriction
    let finalSubcategories = [];
    if (hasSubcategories) {
      if (!isPremium) {
        finalSubcategories = ["java"]; // Force java if restricted
      } else {
        finalSubcategories = selectedSubcategories;
      }
    }

    const config = {
      ...draftSettings,
      subcategories: finalSubcategories,
      isMockInterviewMode: activeTab === "interview",
      timePerQuestion:
        activeTab === "interview" ? 1 : draftSettings.timePerQuestion,
    };
    dispatch(setQuizConfig(config));
    // dispatch(incrementDailyAttempts()); // Uncomment if using daily attempts
    navigate("/quiz");
  };

  // Use the icon from the category object
  const getCategoryIcon = () => {
    const Icon =
      getCurrentCategory(draftSettings.category)?.icon || Cog6ToothIcon; // Fallback icon
    return <Icon className="h-6 w-6 text-purple-500 dark:text-purple-400" />;
  };

  const toggleCategoryDropdown = () => {
    // Don't open dropdown if restricted (only one option anyway)
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
  // --- Add Loading State Handling ---
  if (isLoadingSubscription) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-100 dark:bg-gray-900 pt-12 pb-24 lg:pl-52">
        <TopNavbar />
        <Navbar />
        <div className="flex justify-center items-center flex-grow">
          <Spinner />
        </div>
      </div>
    );
  }
  // Determine if the current category has subcategories to display
  const currentCategoryHasSubcategories = subcategories.length > 0;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2 text-gray-800 dark:text-white">
          <Cog6ToothIcon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500" />
          Configuration
        </h1>

        {/* Tabs */}
        <div className="mb-6">
          {" "}
          {/* Adjusted margin */}
          <div className="flex w-full border-b border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setActiveTab("custom")}
              className={classNames(
                "w-1/2 py-3 px-4 focus:outline-none lg:py-4 lg:px-6 rounded-t-lg transition-colors duration-150 text-sm sm:text-base",
                activeTab === "custom"
                  ? "bg-white dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-500 lg:border-b-4 -mb-px"
                  : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent"
              )}
            >
              <span className="block text-center">Custom Mode</span>
            </button>
            <div className="w-1/2 relative group">
              <button
                onClick={() => {
                  // Allow switching only if authenticated and verified
                  if (isAuthenticated && isEmailVerified) {
                    setActiveTab("interview");
                  }
                }}
                // Disable tab switching if restricted
                disabled={!isPremium}
                className={classNames(
                  "w-full py-3 px-4 focus:outline-none lg:py-4 lg:px-6 rounded-t-lg transition-colors duration-150 text-sm sm:text-base",
                  activeTab === "interview"
                    ? "bg-white dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-500 lg:border-b-4 -mb-px"
                    : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent",
                  !isPremium ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                <span className="block text-center">Interview Mode</span>
              </button>
              {!isPremium && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-full bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                  Subscribe to access Interview Mode.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Dropdown (Common for both tabs) */}
        <div className="mb-6" ref={categoryDropdownRef}>
          {" "}
          {/* Adjusted margin */}
          <label
            htmlFor="category"
            className="block font-medium mb-2 flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-200"
          >
            {getCategoryIcon()}
            Category:
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={toggleCategoryDropdown}
              className={classNames(
                "p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between text-sm sm:text-base",
                "cursor-pointer"
              )}
            >
              <span>
                {getCurrentCategory(draftSettings.category)?.label ||
                  "Select Category"}
                {/* Add description if it exists and category has no subcategories */}
                {getCurrentCategory(draftSettings.category)?.description &&
                  getCurrentCategory(draftSettings.category)?.subcategories
                    .length === 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 italic">
                      {getCurrentCategory(draftSettings.category)?.description}
                    </span>
                  )}
              </span>
              {/* Hide dropdown icon if restricted */}
              {isCategoryDropdownOpen ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
            {/* Only show dropdown options if not restricted */}
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 max-h-60 overflow-y-auto">
                <div className="py-1">
                  {mainCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleChange("category", cat.value)}
                      // Disable other categories if restricted (redundant due to dropdown visibility, but safe)
                      className={classNames(
                        "block w-full px-4 py-2 text-left text-sm sm:text-base border-b border-gray-200 dark:border-gray-600 last:border-b-0",
                        !isPremium
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}
                    >
                      {cat.label}
                      {cat.description && cat.subcategories.length === 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 italic">
                          {cat.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Show restriction message */}
          {!isPremium && (
            <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1.5 text-center">
              Only Java subcategory is available. Upgrade to premium for more
              options.
            </p>
          )}
        </div>

        {/* Subcategories Section (Conditional) */}
        {currentCategoryHasSubcategories && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              {" "}
              {/* Added mb-2 */}
              <label className="block font-medium mb-2 text-base">
                Subcategories:
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {subcategories.map((sub) => {
                // Determine if the button should be disabled
                const isDisabled = !isPremium && sub !== "java";
                return (
                  <button
                    key={sub}
                    onClick={() => handleSubcategoryChange(sub)}
                    disabled={isDisabled} // Disable button based on restriction
                    className={classNames(
                      "flex items-center justify-center border rounded-lg p-2 text-xs sm:text-sm transition-all duration-150 shadow-sm",
                      selectedSubcategories.includes(sub)
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600",
                      isDisabled
                        ? "opacity-50 cursor-not-allowed" // Style for disabled
                        : "hover:opacity-80" // Hover effect for enabled
                    )}
                  >
                    {getDisplaySubcategoryName(sub)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Per Question (Only in Custom Mode) */}
        {activeTab === "custom" && (
          <div className="mb-6" ref={timeDropdownRef}>
            {" "}
            {/* Adjusted margin */}
            <label
              htmlFor="timePerQuestion"
              className="block font-medium mb-2 flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-200"
            >
              <ClockIcon className="h-5 w-5 text-indigo-500 animate-pulse" />
              Time Per Question:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={toggleTimeDropdown}
                className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between cursor-pointer text-sm sm:text-base"
              >
                {timeOptions.find(
                  (option) => option.value === draftSettings.timePerQuestion
                )?.label || "1 minute"}
                {isTimeDropdownOpen ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
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
                        className="block w-full px-4 py-2 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              {draftSettings.timePerQuestion === "0"
                ? "You will have unlimited time for each question."
                : `You will have ${draftSettings.timePerQuestion} minute(s) per question.`}
            </p>
          </div>
        )}

        {/* Mode Specific Info */}
        {activeTab === "custom" && (
          <p className="mb-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
            Customize your quiz. The quiz will have 10 questions.
          </p>
        )}
        {activeTab === "interview" &&
          isPremium && ( // Only show if not restricted
            <p className="mb-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
              Prepare for your interview. The quiz will have 15 questions and 20
              minutes total time.
            </p>
          )}

        {error && (
          <div className="text-red-500 text-sm mb-3 text-center">{error}</div>
        )}

        {/* Start Button */}
        <div className="relative group">
          <button
            onClick={handleApply}
            disabled={isStartButtonDisabled}
            className={`w-full bg-green-500 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 block text-center text-sm sm:text-base ${
              isStartButtonDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-600"
            } text-white`}
          >
            Start
          </button>
          {isStartButtonDisabled &&
            isPremium &&
            currentCategoryHasSubcategories && (
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                At least one subcategory must be selected
              </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuizConfigPage;
