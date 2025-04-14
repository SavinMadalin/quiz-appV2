// src/AuthActionHandlerPage.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "./Spinner"; // Optional: show a spinner during redirect

// Helper function to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AuthActionHandlerPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const mode = query.get("mode");
  const oobCode = query.get("oobCode");
  const continueUrl = query.get("continueUrl"); // Optional, for other flows

  useEffect(() => {
    if (!mode || !oobCode) {
      console.error("Auth action handler: Missing mode or oobCode.");
      // Redirect to a generic error page or home page
      navigate("/");
      return;
    }

    switch (mode) {
      case "verifyEmail":
        // Redirect to your confirmation page, passing the code
        navigate(`/confirmation?oobCode=${oobCode}`);
        break;
      case "resetPassword":
        // Redirect to your password reset page, passing the code
        navigate(`/reset-password?oobCode=${oobCode}`);
        break;
      // Add cases for other modes if needed (e.g., 'recoverEmail')
      // case 'recoverEmail':
      //   navigate(`/recover-email?oobCode=${oobCode}`);
      //   break;
      default:
        console.warn(`Auth action handler: Unknown mode '${mode}'.`);
        navigate("/"); // Redirect home for unknown modes
    }
    // Only run this effect once when the component mounts and query params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, oobCode, navigate]);

  // Optionally display a loading indicator while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 dark:bg-gray-900">
      <Spinner />
      <p className="ml-4 text-gray-700 dark:text-white">
        Processing your request...
      </p>
    </div>
  );
};

export default AuthActionHandlerPage;
