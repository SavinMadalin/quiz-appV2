// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSubscription } from "../contexts/SubscriptionContext"; // Adjust path if needed
import Spinner from "../Spinner"; // Your loading component

const ProtectedRoute = ({ requireAuth = true, requirePremium = false }) => {
  // Get auth state from Redux
  const {
    user,
    isAuthenticated,
    isLoading: isLoadingAuth,
    isEmailVerified,
  } = useSelector((state) => state.user);
  // Get subscription state from context
  const {
    isPremium,
    isLoadingStatus: isLoadingSubscription,
    subscriptionStatus,
  } = useSubscription();
  const location = useLocation();

  // Show spinner while auth or subscription status is loading
  if (isLoadingAuth || isLoadingSubscription) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // 1. Check Authentication if required
  if (requireAuth && !isAuthenticated) {
    console.log("ProtectedRoute: Redirecting to login (Not authenticated)");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Email Verification if authenticated (allow access to settings page regardless)
  if (
    requireAuth &&
    isAuthenticated &&
    !isEmailVerified &&
    location.pathname !== "/settings"
  ) {
    console.log("ProtectedRoute: Redirecting to settings (Email not verified)");
    // Redirect to settings page to show the "Resend Verification" button
    return (
      <Navigate
        to="/settings"
        state={{ from: location, needsVerification: true }}
        replace
      />
    );
  }

  // 3. Check Premium Status if required (only if authenticated and verified)
  if (requirePremium && isAuthenticated && isEmailVerified && !isPremium) {
    console.log(
      `ProtectedRoute: Redirecting to subscribe (Not premium. Status: ${subscriptionStatus})`
    );
    // Redirect to subscription page, maybe pass state indicating why
    return (
      <Navigate
        to="/subscribe"
        state={{ from: location, reason: "premium_required" }}
        replace
      />
    );
  }

  // If all checks pass, render the child route(s)
  return <Outlet />;
};

export default ProtectedRoute;
