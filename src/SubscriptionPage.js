// src/SubscriptionPage.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import { StarIcon } from "@heroicons/react/24/solid";
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

    setIsLoading(true); // <<< --- SET LOADING TO TRUE HERE ---
    const selectedPlanDetails = plans[selectedPlan];

    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      // If redirectToCheckout is successful, the user is navigated away,
      // so setIsLoading(false) might not be strictly necessary here if navigation happens.
      // However, it's good practice to have it in the finally block.
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false); // <<< --- SET LOADING TO FALSE IN FINALLY ---
    }
  };

  if (isLoadingSubscriptionStatus) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white pt-12 pb-24 lg:pl-52 lg:mt-8">
        <TopNavbar />
        <Navbar />
        <div className="flex justify-center items-center flex-grow">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white pt-12 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-5 md:p-6 rounded-lg shadow-lg max-w-lg w-full mt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center flex items-center justify-center gap-1.5">
          <StarIcon className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
          {isPremium ? "Your Premium Access" : "Unlock Premium Access"}
        </h2>
        <p className="text-sm sm:text-base text-center mb-5 text-gray-700 dark:text-gray-300">
          {isPremium
            ? "Thank you for being a DevPrep Premium member!"
            : "Supercharge your interview preparation with DevPrep Premium!"}
        </p>

        {/* Feature Comparison Table (always shown) */}
        <div className="mb-6 border rounded-lg overflow-hidden border-gray-300 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-700 p-2 font-semibold text-center text-sm">
            <div className="text-left">Feature</div>
            <div>Basic</div>
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              <StarIcon className="h-4 w-4" /> Premium
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="grid grid-cols-3 gap-1.5 p-1.5 items-center text-xs"
              >
                <div className="text-left">{feature.name}</div>
                <div className="flex justify-center">
                  {feature.basic ? (
                    <OutlineCheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <OutlineXIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.premium ? (
                    <OutlineCheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <OutlineXIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Section: Plans or Settings Button */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-5">
          {isPremium ? (
            <>
              <p className="text-base font-bold mb-4 text-gray-700 dark:text-gray-300">
                Manage your subscription details:
              </p>
              <button
                onClick={() => navigate("/subscription-settings")}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm flex items-center justify-center gap-2"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                Subscription Settings
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">
                Choose Your Plan
              </h3>
              <div className="flex flex-col gap-2 mb-5 grid grid-cols-3 sm:gap-2">
                {Object.values(plans).map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    disabled={isLoading}
                    className={classNames(
                      "flex-1 p-2 rounded-lg border transition-all duration-200 text-left",
                      "sm:p-2.5",
                      selectedPlan === plan.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    )}
                  >
                    <p className="font-bold text-xs mb-0.5 sm:text-sm sm:mb-0.5">
                      {plan.name}
                    </p>
                    <p className="text-base font-extrabold mb-0.5 sm:text-lg sm:mb-0.5">
                      {plan.price}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      per {plan.interval}
                    </p>
                    {plan.save && (
                      <span className="inline-block bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100 text-xs font-semibold mt-1 px-1.5 py-0.5 rounded">
                        {plan.save}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubscription}
                disabled={isLoading}
                className={classNames(
                  "w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm",
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
