// src/components/QuestionGenerator.js
import React, { useState } from "react";
import {
  CheckIcon as SolidCheckIcon,
  CogIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

const QuestionGenerator = () => {
  // State moved from MainPage
  const [generateCategory, setGenerateCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  // Generator Function moved from MainPage
  const handleGenerate = async () => {
    if (!generateCategory.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerateSuccess(false);
    setGenerateError(null);

    try {
      // Make sure the backend URL is correct
      const response = await fetch("http://localhost:3001/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: generateCategory }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Optionally clear category input on success
      // setGenerateCategory("");
      setGenerateSuccess(true);
      // Optionally hide success message after a delay
      // setTimeout(() => setGenerateSuccess(false), 3000);
    } catch (error) {
      setGenerateError(error.message || "Failed to generate questions.");
      // Optionally hide error message after a delay
      // setTimeout(() => setGenerateError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    // JSX moved from MainPage
    <section className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-4xl w-full mt-8 mb-12">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Generate Quiz Questions (Admin)
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          value={generateCategory}
          onChange={(e) => setGenerateCategory(e.target.value)}
          placeholder="Enter category (e.g., java, react)"
          className="flex-grow p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        />
        <button
          onClick={handleGenerate}
          disabled={!generateCategory.trim() || isGenerating}
          className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out flex items-center justify-center w-full sm:w-auto ${
            isGenerating || !generateCategory.trim()
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {isGenerating ? (
            <CogIcon className="h-5 w-5 mr-2 animate-spin" />
          ) : generateSuccess ? (
            <SolidCheckIcon className="h-5 w-5 mr-2" />
          ) : null}{" "}
          {/* Removed default "Generate" text inside button */}
          {isGenerating
            ? "Generating..."
            : generateSuccess
            ? "Done!"
            : "Generate"}
        </button>
      </div>
      {generateError && (
        <p className="text-red-500 mt-3 text-center flex items-center justify-center gap-1">
          <ExclamationCircleIcon className="h-5 w-5" /> {generateError}
        </p>
      )}
      {generateSuccess && !isGenerating && (
        <p className="text-green-500 mt-3 text-center flex items-center justify-center gap-1">
          <SolidCheckIcon className="h-5 w-5" /> Generation complete!
        </p>
      )}
    </section>
  );
};

export default QuestionGenerator;
