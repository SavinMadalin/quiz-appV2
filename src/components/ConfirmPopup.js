// src/components/ConfirmPopup.js
import React from "react"; // Import React

const ConfirmPopup = ({
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  isDestructive = true,
}) => {
  return (
    // Outer container for the overlay and centering
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      {/* Inner container for the popup content - Added ml-8 */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        <p className="mb-6 text-gray-700 dark:text-gray-200 text-center text-sm sm:text-base">
          {message}
        </p>
        <div className="flex justify-center sm:justify-end space-x-3 sm:space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 sm:py-2.5 sm:px-5 rounded-lg shadow-sm hover:shadow-md transition-all text-sm"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className={`${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-500 hover:bg-indigo-600"
            } text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-5 rounded-lg shadow-sm hover:shadow-md transition-all text-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
