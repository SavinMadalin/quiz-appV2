// src/SubscriptionPage.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import { StarIcon } from "@heroicons/react/24/solid";
import { auth } from "./firebase";
import {
  CheckIcon as OutlineCheckIcon,
  XMarkIcon as OutlineXIcon,
  Cog6ToothIcon,
  ArrowPathIcon, // Import spinner icon or use your existing Spinner component
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useStripe } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; // Import Link for messages
import { useSubscription } from "./contexts/SubscriptionContext"; // Import useSubscription
import Spinner from "./Spinner";

// const API_BASE_URL = "http://localhost:4242";
const API_BASE_URL =
  "https://devprep-backend--myproject-6969b.europe-west4.hosted.app";

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false); // This state will control the spinner
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const navigate = useNavigate(); // Initialize useNavigate
  const { user, isAuthenticated, isEmailVerified } = useSelector(
    (state) => state.user
  );

  const {
    isPremium,
    isLoadingStatus: isLoadingSubscriptionStatus,
    subscriptionDetails, // We might use this later on the settings page
  } = useSubscription();

  // Feature comparison data
  const features = [
    { name: "Core Languages (Java)", basic: true, premium: true },
    { name: "All Categories Access", basic: false, premium: true },
    { name: "Full Question Bank Access", basic: false, premium: true },
    { name: "Interview Mode", basic: false, premium: true },
    { name: "Personalized Feedback", basic: false, premium: true },
    { name: "History Tracking", basic: true, premium: true },
    { name: "Priority Support", basic: false, premium: true },
  ];

  // Plan details
  const plans = {
    monthly: {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      interval: "month",
      stripePriceId: "price_1RInSv5v1qgAdBzCu5ctKVbF",
    },
    sixMonths: {
      id: "sixMonths",
      name: "6 Months",
      price: "$49.99",
      interval: "6 months",
      save: "Save 15%",
      stripePriceId: "price_1RInXT5v1qgAdBzCdwBOi231",
    },
    yearly: {
      id: "yearly",
      name: "Yearly",
      price: "$89.99",
      interval: "year",
      save: "Save 25%",
      stripePriceId: "price_1RInYr5v1qgAdBzC4B8M1XXn",
    },
  };

  const getAuthToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    console.warn("No current user found to get ID token.");
    return null;
  };

  const handleSubscription = async () => {
    setError(null);

    if (!stripe) {
      setError("Payment system initializing... Please wait a moment.");
      return;
    }
    if (!isAuthenticated || !user) {
      setError("Please log in to subscribe.");
      return;
    }
    if (!isEmailVerified) {
      setError(
        <>
          Please verify your account email before subscribing. Check your inbox
          or visit{" "}
          <Link to="/settings" className="underline hover:text-blue-400">
            Settings
          </Link>{" "}
          to resend.
        </>
      );
      return;
    }
    const token = await getAuthToken();

    setIsLoading(true);
    const selectedPlanDetails = plans[selectedPlan];

    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: selectedPlanDetails.stripePriceId,
          planId: selectedPlanDetails.id,
          userId: user.uid,
          isVerified: isEmailVerified,
          userEmail: user.email,
          userName: user.displayName,
        }),
      });

      const session = await response.json();

      if (!response.ok) {
        throw new Error(
          session.error || `Failed to create session (${response.status})`
        );
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (stripeError) {
        console.error("Stripe redirect error:", stripeError);
        setError(stripeError.message || "Failed to redirect to payment page.");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSubscriptionStatus) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-12 pb-24 lg:pl-52 lg:mt-8">
        <TopNavbar />
        <Navbar />
        <div className="flex justify-center items-center flex-grow">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-12 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg lg:max-w-3xl w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 lg:mb-6 text-center flex items-center justify-center gap-2 text-gray-800 dark:text-white">
          <StarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
          {isPremium ? "Your Premium Access" : "Unlock Premium Access"}
        </h2>
        <p className="text-sm sm:text-base text-center mb-6 lg:mb-8 text-gray-600 dark:text-gray-300">
          {isPremium
            ? "Thank you for being a DevPrep Premium member!"
            : "Supercharge your interview preparation with DevPrep Premium!"}
        </p>

        {/* Feature Comparison Table (always shown) */}
        <div className="mb-8 lg:mb-10 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md">
          <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 lg:p-4 font-semibold text-center text-sm lg:text-base text-gray-700 dark:text-gray-200">
            <div className="text-left pl-1">Feature</div>
            <div>Basic</div>
            <div className="flex items-center justify-center gap-1 text-yellow-400 dark:text-yellow-300">
              <StarIcon className="h-4 w-4 lg:h-5 lg:w-5" /> Premium
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="grid grid-cols-3 gap-1.5 lg:gap-2 p-2.5 lg:p-3 items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300"
              >
                <div className="text-left pl-1">{feature.name}</div>
                <div className="flex justify-center">
                  {feature.basic ? (
                    <OutlineCheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <OutlineXIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.premium ? (
                    <OutlineCheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <OutlineXIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Section: Plans or Settings Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 lg:pt-8">
          {isPremium ? (
            <>
              <p className="text-base sm:text-lg font-semibold mb-5 text-gray-700 dark:text-gray-200 text-center">
                Manage your subscription details:
              </p>
              <button
                onClick={() => navigate("/subscription-settings")}
                className="w-full sm:w-auto mx-auto bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-6 lg:py-3 lg:px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                Subscription Settings
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 lg:mb-5 text-gray-800 dark:text-white">
                Choose Your Plan
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 lg:mb-8">
                {" "}
                {/* Changed to grid-cols-3 by default and adjusted gap */}
                {Object.values(plans).map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    disabled={isLoading}
                    className={classNames(
                      "p-2 sm:p-3 lg:p-4 rounded-lg border-2 transition-all duration-200 text-left shadow-sm hover:shadow-md", // Adjusted padding

                      selectedPlan === plan.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 ring-2 ring-indigo-500"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30",
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    )}
                  >
                    <p className="font-semibold text-xs sm:text-sm lg:text-base text-gray-800 dark:text-white mb-0.5 sm:mb-1">
                      {" "}
                      {/* Adjusted text size and margin */}
                      {plan.name}
                    </p>
                    <p className="text-sm sm:text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-0.5 sm:mb-1">
                      {" "}
                      {/* Adjusted text size and margin */}
                      {plan.price}
                    </p>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                      {" "}
                      {/* Adjusted text size */}
                      per {plan.interval}
                    </p>
                    {plan.save && (
                      <span className="inline-block bg-yellow-400 text-gray-800 text-[9px] sm:text-xs font-semibold mt-1 sm:mt-2 px-1.5 py-0.5 sm:px-2 rounded-full">
                        {" "}
                        {/* Adjusted text size, padding, and margin */}
                        {plan.save}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-5 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubscription}
                disabled={isLoading}
                className={classNames(
                  "w-full sm:w-auto mx-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-6 lg:py-3 lg:px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base flex items-center justify-center gap-2",
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                    Processing...
                  </div>
                ) : (
                  `Subscribe to ${plans[selectedPlan].name} Plan`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
