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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-20">
      {/* Inner container for the popup content - Removed ml-20 to re-center horizontally */}
      {/* Added max-w-sm w-full for consistent sizing */}
      <div className="bg-white dark:bg-dark-grey p-6 rounded-lg shadow-xl max-w-sm w-full relative ml-20">
        <h3 className="text-xl font-bold mb-4 text-center">
          Select a New Plan
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          Your new plan will take effect at the start of your next billing
          cycle.
        </p>
        <div className="grid grid-cols-1 gap-3 mb-4">
          {availablePlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              disabled={isLoading} // Disable buttons while loading
              className={classNames(
                "w-full border rounded-md p-4 text-left transition-all duration-200", // Increased padding
                "flex flex-col",
                "border-blue-500", // Keep blue border
                "hover:bg-blue-100 dark:hover:bg-blue-900/50", // Added hover background effect
                "focus:outline-none focus:ring-2 focus:ring-blue-500", // Focus ring
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <span className="font-bold text-base">{plan.name} Plan</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {plan.price} per {plan.interval} {plan.save && `(${plan.save})`}
              </span>
              {isLoading && ( // Show spinner inside the button if loading
                <div className="flex items-center justify-center mt-2">
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
          className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChangePlanPopup;
