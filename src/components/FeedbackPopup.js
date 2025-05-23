import { XMarkIcon } from "@heroicons/react/24/outline"; // Import icons

const FeedbackPopup = ({ feedback, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full relative border border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h3 className="text-xl sm:text-2xl font-bold mb-5 text-center text-gray-800 dark:text-white">
          Feedback
        </h3>
        <div className="max-h-60 sm:max-h-72 overflow-y-auto p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/30">
          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
            {feedback}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;
