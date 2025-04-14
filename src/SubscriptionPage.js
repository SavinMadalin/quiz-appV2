// src/SubscriptionPage.js
import React, { useState } from "react"; // Import useState
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import { StarIcon } from "@heroicons/react/24/solid"; // Using solid icons for emphasis
import {
  CheckIcon as OutlineCheckIcon, // Checkmark for Premium
  XMarkIcon as OutlineXIcon, // X mark for Basic
} from "@heroicons/react/24/outline";
import classNames from "classnames"; // Import classNames for conditional styling

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("monthly"); // State for selected plan ('monthly', 'sixMonths', 'yearly')

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

  // Example plan details
  const plans = {
    monthly: {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      interval: "month",
    },
    sixMonths: {
      id: "sixMonths",
      name: "6 Months",
      price: "$49.99",
      interval: "6 months",
      save: "Save 15%", // Optional save message
    },
    yearly: {
      id: "yearly",
      name: "Yearly",
      price: "$89.99",
      interval: "year",
      save: "Save 25%",
    },
  };

  // Placeholder function for handling subscription logic
  const handleSubscription = (planId) => {
    console.log("Subscribing to plan:", planId);
    // Add your subscription logic here (e.g., redirect to Stripe checkout)
  };

  return (
    // Apply the standard page layout padding
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white pt-12 pb-24 lg:pl-52">
      <TopNavbar />
      <Navbar />

      {/* Main Content Area */}
      <div className="bg-white dark:bg-dark-grey p-6 md:p-8 rounded-lg shadow-lg max-w-2xl w-full mt-8">
        {/* Adjusted title size: text-2xl default, text-3xl on sm */}
        <h2 className="text-2xl sm:text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
          <StarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />{" "}
          {/* Adjusted icon size */}
          Unlock Premium Access
        </h2>

        {/* Adjusted paragraph size: text-base default, text-lg on sm */}
        <p className="text-base sm:text-lg text-center mb-6 text-gray-700 dark:text-gray-300">
          Supercharge your interview preparation with DevPrep Premium!
        </p>

        {/* Feature Comparison Table */}
        <div className="mb-8 border rounded-lg overflow-hidden border-gray-300 dark:border-gray-600">
          {/* Header Row */}
          <div className="grid grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-700 p-3 font-semibold text-center">
            <div className="text-left">Feature</div>
            <div>Basic</div>
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              <StarIcon className="h-4 w-4" /> Premium
            </div>
          </div>
          {/* Feature Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {features.map((feature) => (
              <div
                key={feature.name} // Use feature name as key for stability
                // Reduced padding, gap, and text size for smaller screens
                className="grid grid-cols-3 gap-2 p-2 sm:gap-4 sm:p-3 items-center text-xs sm:text-sm"
              >
                <div className="text-left">{feature.name}</div>
                <div className="flex justify-center">
                  {feature.basic ? (
                    <OutlineCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" /> // Smaller icon on mobile
                  ) : (
                    <OutlineXIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" /> // Smaller icon on mobile
                  )}
                </div>
                <div className="flex justify-center">
                  {feature.premium ? (
                    <OutlineCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" /> // Smaller icon on mobile
                  ) : (
                    <OutlineXIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" /> // Smaller icon on mobile
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-6 text-center">
          {/* Adjusted pricing title size: text-xl default, text-2xl on sm */}
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            Choose Your Plan
          </h3>

          {/* Plan Selection Buttons */}
          <div className="flex flex-row gap-2 mb-6 sm:grid sm:grid-cols-3 sm:gap-3">
            {Object.values(plans).map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={classNames(
                  "flex-1 p-1.5 rounded-lg border transition-all duration-200 text-left",
                  "sm:p-3",
                  selectedPlan === plan.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}
              >
                <p className="font-bold text-xs mb-0 sm:text-base sm:mb-1">
                  {plan.name}
                </p>
                <p className="text-base font-extrabold mb-0 sm:text-xl sm:mb-1">
                  {plan.price}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  per {plan.interval}
                </p>
                {plan.save && (
                  <span className="inline-block bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100 text-xs font-semibold mt-1 px-1.5 py-0.5 rounded sm:px-2">
                    {plan.save}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Subscribe Button */}
          <button
            onClick={() => handleSubscription(selectedPlan)}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Subscribe to {plans[selectedPlan].name} Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
