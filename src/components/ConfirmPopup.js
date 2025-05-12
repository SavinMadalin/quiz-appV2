// src/components/ConfirmPopup.js
import React from "react"; // Import React

const ConfirmPopup = ({ message, onConfirm, onCancel }) => {
  return (
    // Outer container for the overlay and centering
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Inner container for the popup content - Added ml-8 */}
      <div className="bg-white dark:bg-dark-grey p-6 rounded-lg shadow-lg max-w-md w-full ml-20">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
