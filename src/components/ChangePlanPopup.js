// src/components/ChangePlanPopup.js
import React from "react";
import classNames from "classnames";
import { ArrowPathIcon } from "@heroicons/react/24/outline"; // Import spinner icon

const ChangePlanPopup = ({
  availablePlans,
  onSelectPlan,
  onClose,
  isLoading,
}) => {
  return (
    // Outer container for the overlay and positioning
    // Changed items-center to items-start and added pt-20 for top padding
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 pt-16 sm:pt-20">
      {/* Inner container for the popup content - Removed ml-20 to re-center horizontally */}
      {/* Added max-w-sm w-full for consistent sizing */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full relative border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 text-center text-gray-800 dark:text-white">
          Select a New Plan
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          Your new plan will take effect at the start of your next billing
          cycle.
        </p>
        <div className="grid grid-cols-1 gap-3 mb-6">
          {availablePlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              disabled={isLoading} // Disable buttons while loading
              className={classNames(
                "w-full border-2 rounded-lg p-3 sm:p-4 text-left transition-all duration-200 shadow-sm",
                "flex flex-col items-start", // Align items to start for better text flow
                "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30", // Base style for plan buttons
                "hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <div className="flex justify-between items-center w-full mb-1">
                {" "}
                {/* Flex container for name and save badge */}
                <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                  {plan.name} Plan
                </span>
                {plan.save && (
                  <span className="bg-yellow-400 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {" "}
                    {/* Updated Save Badge */}
                    {plan.save}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {plan.price} per {plan.interval}
              </span>
              {isLoading && ( // Show spinner inside the button if loading
                <div className="flex items-center justify-center mt-2 text-gray-600 dark:text-gray-300">
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Updating...
                </div>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          disabled={isLoading} // Disable close button while loading
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all text-sm disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChangePlanPopup;
