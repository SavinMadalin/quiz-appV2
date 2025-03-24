import { XMarkIcon } from '@heroicons/react/24/outline'; // Import icons

const FeedbackPopup = ({ feedback, onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h3 className="text-xl font-bold mb-4">Feedback</h3>
        <div className="max-h-60 overflow-y-auto p-4 border rounded-lg dark:border-gray-600">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{feedback}</p>
        </div>
      </div>
    </div>
  );
};