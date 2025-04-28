// src/SubscriptionSuccessPage.js
import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useSubscription } from "./contexts/SubscriptionContext"; // Import context hook

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refreshSubscriptionStatus } = useSubscription(); // Get refresh function

  useEffect(() => {
    // Optional: Log the session ID
    console.log("Checkout Session ID:", sessionId);

    // Trigger a manual refresh of the subscription status from Firestore.
    // The webhook should update Firestore, but this can help sync the UI faster
    // if the user returns immediately before the webhook is fully processed.
    refreshSubscriptionStatus();
  }, [sessionId, refreshSubscriptionStatus]); // Add dependencies

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white">
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Subscription Activated!</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Thank you! Your DevPrep Premium access is now active. It might take a
          moment for all features to reflect the change.
        </p>
        <Link
          to="/" // Link back to the main page or dashboard
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
