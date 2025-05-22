// src/SubscriptionSettingsPage.js
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import { auth } from "./firebase";
import {
  CreditCardIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  CheckCircleIcon as SolidCheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useSubscription } from "./contexts/SubscriptionContext";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
import ConfirmPopup from "./components/ConfirmPopup";
import classNames from "classnames";
import ChangePlanPopup from "./components/ChangePlanPopup";

const API_BASE_URL = "http://localhost:4242";

// const API_BASE_URL =
//   "https://devprep-backend--myproject-6969b.europe-west4.hosted.app"; // Or your actual backend URL

const SubscriptionSettingsPage = () => {
  const {
    subscriptionDetails,
    isLoadingStatus: isLoadingSubscription,
    refreshSubscriptionStatus,
  } = useSubscription();
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [planChangeError, setPlanChangeError] = useState(null);
  const [planChangeSuccess, setPlanChangeSuccess] = useState(false);
  const [showChangePlanPopup, setShowChangePlanPopup] = useState(false);

  const [isTogglingAutoRenew, setIsTogglingAutoRenew] = useState(false);
  const [autoRenewError, setAutoRenewError] = useState(null);
  const [autoRenewSuccess, setAutoRenewSuccess] = useState(null);

  // --- Define Plans ---
  const plans = {
    monthly: {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      interval: "month",
      stripePriceId: "price_1RInSv5v1qgAdBzCu5ctKVbF",
      order: 1,
    },
    sixMonths: {
      id: "sixMonths",
      name: "6 Months",
      price: "$49.99",
      interval: "6 months",
      save: "Save 15%",
      stripePriceId: "price_1RInXT5v1qgAdBzCdwBOi231",
      order: 2,
    },
    yearly: {
      id: "yearly",
      name: "Yearly",
      price: "$89.99",
      interval: "year",
      save: "Save 25%",
      stripePriceId: "price_1RInYr5v1qgAdBzC4B8M1XXn",
      order: 3,
    },
  };

  // --- Determine Available Plans for Change ---
  const currentPlanId = subscriptionDetails?.planId;
  const currentPlanDetails = plans[currentPlanId];

  const availableUpgradePlans = Object.values(plans).filter(
    (plan) => plan.order > (currentPlanDetails?.order || 0)
  );

  // --- Calculate Next Renewal Date (Using updated or created date) ---
  const calculateNextRenewalDate = (
    updatedTimestamp, // Prefer updated
    createdTimestamp, // Fallback to created
    planId
  ) => {
    // Use updated timestamp if available and seems valid, otherwise use created timestamp
    const baseTimestamp =
      updatedTimestamp &&
      (typeof updatedTimestamp.toDate === "function" ||
        typeof updatedTimestamp.seconds === "number" ||
        updatedTimestamp instanceof Date)
        ? updatedTimestamp
        : createdTimestamp;

    if (!baseTimestamp || !planId) {
      return "N/A";
    }

    try {
      // Ensure baseTimestamp is a Date object
      const baseDate =
        typeof baseTimestamp.toDate === "function" // Check if it's a Firestore Timestamp
          ? baseTimestamp.toDate()
          : baseTimestamp instanceof Date // Check if it's already a Date object
          ? baseTimestamp
          : typeof baseTimestamp.seconds === "number" // Check if it has seconds property
          ? new Date(baseTimestamp.seconds * 1000)
          : null; // If none of the above, it's not a recognized format

      if (!baseDate || isNaN(baseDate.getTime())) {
        console.error(
          "Error calculating next renewal date: Could not convert baseTimestamp to a valid Date object."
        );
        return "N/A"; // Invalid date
      }

      const plan = plans[planId];
      if (!plan) {
        console.error(
          `Error calculating next renewal date: Plan details not found for planId: ${planId}`
        );
        return "N/A"; // Plan not found
      }

      const nextRenewalDate = new Date(baseDate); // Start with the base date

      // Add the interval based on the plan
      switch (plan.interval) {
        case "month":
          nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
          break;
        case "6 months":
          nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 6);
          break;
        case "year":
          nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
          break;
        default:
          console.error(
            `Error calculating next renewal date: Unrecognized plan interval: ${plan.interval} for planId: ${planId}`
          );
          return "N/A"; // Unrecognized interval
      }

      // Handle potential date issues (e.g., adding a month to Jan 31st)
      // If the month changed unexpectedly, set the date to the last day of the previous month
      if (nextRenewalDate.getDate() !== baseDate.getDate()) {
        nextRenewalDate.setDate(0); // Set to the last day of the previous month
      }

      return nextRenewalDate.toLocaleDateString(); // Format the date
    } catch (error) {
      console.error("Error calculating next renewal date:", error);
      return "N/A";
    }
  };

  // --- Debugging Renewal Date (Removed) ---
  // useEffect(() => { ... }, [subscriptionDetails]);

  const getAuthToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    console.warn("No current user found to get ID token.");
    return null;
  };

  const handleCancelSubscription = async () => {
    setShowCancelConfirm(false); // Close confirm popup
    setIsCancelling(true);
    setCancelError(null);
    const token = await getAuthToken();
    if (!token) {
      setCancelError("You must be logged in to perform this action.");
      setIsCancelling(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cancel-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscriptionDetails?.stripeSubscriptionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel subscription.");
      }
      await refreshSubscriptionStatus();
      setCancelError("Subscription set to cancel at the end of the period.");
      setTimeout(() => setCancelError(null), 5000);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setCancelError(error.message || "Could not cancel subscription.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleChangePlan = async (newPlanDetails) => {
    setShowChangePlanPopup(false); // Close the popup
    setIsChangingPlan(true);
    setPlanChangeError(null);
    setPlanChangeSuccess(false);

    if (!subscriptionDetails?.stripeSubscriptionId) {
      setPlanChangeError("Could not find your active subscription.");
      setIsChangingPlan(false);
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      setPlanChangeError("You must be logged in to perform this action.");
      setIsChangingPlan(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/update-subscription-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscriptionDetails.stripeSubscriptionId,
          newPriceId: newPlanDetails.stripePriceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change plan.");
      }
      await refreshSubscriptionStatus();
      setPlanChangeSuccess(true);
      setTimeout(() => setPlanChangeSuccess(false), 5000);
    } catch (error) {
      console.error("Error changing plan:", error);
      setPlanChangeError(error.message || "Could not change plan.");
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleToggleAutoRenew = async (enable) => {
    setIsTogglingAutoRenew(true);
    setAutoRenewError(null);
    setAutoRenewSuccess(null);

    if (!subscriptionDetails?.stripeSubscriptionId) {
      setAutoRenewError("Could not find your active subscription.");
      setIsTogglingAutoRenew(false);
      return;
    }
    const token = await getAuthToken();
    if (!token) {
      setAutoRenewError("You must be logged in to perform this action.");
      setIsTogglingAutoRenew(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/toggle-auto-renew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscriptionDetails.stripeSubscriptionId,
          enableAutoRenew: enable,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update auto-renewal status."
        );
      }
      await refreshSubscriptionStatus();
      setAutoRenewSuccess(
        enable
          ? "Auto-renewal has been enabled."
          : "Auto-renewal has been disabled. Your subscription will cancel at the period end."
      );
      setTimeout(() => setAutoRenewSuccess(null), 5000);
    } catch (error) {
      console.error("Error toggling auto-renew:", error);
      setAutoRenewError(
        error.message || "Could not update auto-renewal status."
      );
    } finally {
      setIsTogglingAutoRenew(false);
    }
  };

  if (isLoadingSubscription) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gray-100 dark:bg-gray-900 pt-20 pb-28 lg:pl-28">
        <TopNavbar />
        <Navbar />
        <div className="flex justify-center items-center flex-grow">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!subscriptionDetails || !subscriptionDetails.status) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-20 pb-28 lg:pl-28">
        <TopNavbar />
        <Navbar />
        <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full mt-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            No Active Subscription Found
          </h2>
          <p className="mb-6">
            It seems you don't have an active premium subscription.
          </p>
          <button
            onClick={() => navigate("/subscription")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            View Subscription Plans
          </button>
        </div>
      </div>
    );
  }

  const {
    planId,
    status,
    currentPeriodEnd, // Keep this, maybe it will be populated later by webhook
    cancelAtPeriodEnd,
    created, // Get the created timestamp
    updated, // Get the updated timestamp
  } = subscriptionDetails;

  const planName = currentPlanDetails?.name || "N/A";

  // Use calculated date based on updated or created timestamp
  const nextBillingOrCancellationDate = calculateNextRenewalDate(
    updated, // Pass updated first
    created, // Pass created second
    planId // Pass planId third
  );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-20 pb-28 lg:pl-28">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full mt-8">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <CreditCardIcon className="h-8 w-8" />
          Subscription Plan
        </h2>

        {/* Current Plan Section */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Current Plan</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Plan:</span> {planName}
            </p>
            <p className="flex items-center">
              <span className="font-medium mr-1">Status:</span>
              {status === "active" ? (
                <CheckBadgeIcon className="h-5 w-5 text-green-500 mr-1" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
              )}
              <span
                className={classNames(
                  "capitalize",
                  status === "active"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {status}
              </span>
            </p>
            {status === "active" && (
              <p className="flex items-center">
                <CalendarDaysIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="font-medium mr-1">
                  {cancelAtPeriodEnd ? "Cancels on:" : "Renews on:"}
                </span>{" "}
                {nextBillingOrCancellationDate}
              </p>
            )}
            {cancelAtPeriodEnd && (
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                Your subscription is set to cancel at the end of the current
                period.
              </p>
            )}
          </div>
        </section>

        {/* Manage Auto-Renewal / Cancel Subscription Section */}
        {subscriptionDetails?.status === "active" && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Subscription Renewal</h3>
            {autoRenewError && (
              <p className="text-red-500 text-sm mb-4">{autoRenewError}</p>
            )}
            {autoRenewSuccess && (
              <p className="text-green-500 text-sm mb-4">{autoRenewSuccess}</p>
            )}
            {cancelError && !planChangeSuccess && (
              <p className="text-red-500 text-sm mb-4">{cancelError}</p>
            )}

            {/* Auto-Renewal Status and Toggle */}
            <div className="flex items-center justify-between gap-3 text-sm mb-4">
              <span className="font-medium">Auto-Renewal:</span>
              {/* ON/OFF Toggle Button */}
              <button
                onClick={() => {
                  // If auto-renew is currently ON (cancelAtPeriodEnd is false),
                  // clicking means they want to DISABLE it (set cancelAtPeriodEnd to true).
                  // This triggers the cancel confirmation flow.
                  if (!subscriptionDetails.cancelAtPeriodEnd) {
                    setShowCancelConfirm(true);
                  } else {
                    // If auto-renew is currently OFF (cancelAtPeriodEnd is true),
                    // clicking means they want to ENABLE it (set cancelAtPeriodEnd to false).
                    handleToggleAutoRenew(true); // Call the toggle function directly
                  }
                }}
                disabled={isTogglingAutoRenew || isCancelling || isChangingPlan}
                className={classNames(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
                  subscriptionDetails.cancelAtPeriodEnd
                    ? "bg-gray-400"
                    : "bg-green-600" // Background based on state
                )}
              >
                <span className="sr-only">Toggle Auto-Renewal</span>
                <span
                  className={classNames(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    subscriptionDetails.cancelAtPeriodEnd
                      ? "translate-x-1"
                      : "translate-x-6" // Position based on state
                  )}
                />
              </button>
            </div>
          </section>
        )}

        {/* Change Plan Section (Now a single button to open popup) */}
        {status === "active" &&
          !cancelAtPeriodEnd && // Can only change plan if active and not set to cancel
          availableUpgradePlans.length > 0 && (
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Change Plan</h3>
              {planChangeError && !cancelError && (
                <p className="text-red-500 text-sm mb-4">{planChangeError}</p>
              )}
              {planChangeSuccess && (
                <p className="text-green-500 text-sm mb-4">
                  Plan change initiated! Your new plan will take effect on your
                  next billing date ({nextBillingOrCancellationDate}).
                </p>
              )}
              <button
                onClick={() => setShowChangePlanPopup(true)} // Open the popup
                disabled={isChangingPlan || isCancelling || isTogglingAutoRenew}
                className={classNames(
                  "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-opacity disabled:opacity-50",
                  isChangingPlan || isCancelling || isTogglingAutoRenew
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                )}
              >
                {isChangingPlan ? (
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                )}
                Change Plan
              </button>
            </section>
          )}

        {/* Manage Billing (Stripe Customer Portal) */}
        <section>
          <h3 className="text-xl font-semibold mb-3">Billing Information</h3>
          <button
            onClick={() =>
              alert(
                "Redirect to Stripe Customer Portal functionality to be implemented."
              )
            }
            disabled={isChangingPlan || isCancelling || isTogglingAutoRenew}
            className={classNames(
              "w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-opacity disabled:opacity-50",
              isChangingPlan || isCancelling || isTogglingAutoRenew
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
          >
            <PencilSquareIcon className="h-5 w-5" />
            Manage Billing Details
          </button>
        </section>
      </div>

      {/* Confirm Popups */}
      {showCancelConfirm && (
        <ConfirmPopup
          message="Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period."
          onConfirm={handleCancelSubscription} // This function sets cancel_at_period_end: true
          onCancel={() => setShowCancelConfirm(false)}
          confirmText="Yes, Cancel"
          isDestructive={true}
        />
      )}

      {/* Change Plan Popup */}
      {showChangePlanPopup && (
        <ChangePlanPopup
          availablePlans={availableUpgradePlans}
          onSelectPlan={handleChangePlan} // Pass the handler to the popup
          onClose={() => setShowChangePlanPopup(false)}
          isLoading={isChangingPlan} // Pass loading state to disable buttons in popup
        />
      )}
    </div>
  );
};

export default SubscriptionSettingsPage;
