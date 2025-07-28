// src/PoliciesPage.js
import React, { useState, useEffect } from "react";
import { storage } from "./firebase";
import { ref, getDownloadURL } from "firebase/storage";
import TopNavbar from "./components/TopNavbar";
import Navbar from "./Navbar";
import classNames from "classnames";

const PoliciesPage = () => {
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");
  const [cookieContent, setCookieContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Terms and Conditions
        const termsStorageRef = ref(
          storage,
          "policies/termsandconditions.html"
        );

        const termsURL = await getDownloadURL(termsStorageRef);
        const termsResponse = await fetch(termsURL);
        if (!termsResponse.ok) {
          throw new Error(`HTTP error! status: ${termsResponse.status}`);
        }
        const termsHTML = await termsResponse.text();
        setTermsContent(termsHTML);

        // Fetch Privacy Policy
        const privacyStorageRef = ref(storage, "policies/dataprivacy.html");
        const privacyURL = await getDownloadURL(privacyStorageRef);
        const privacyResponse = await fetch(privacyURL);
        if (!privacyResponse.ok) {
          throw new Error(`HTTP error! status: ${privacyResponse.status}`);
        }
        const privacyHTML = await privacyResponse.text();
        setPrivacyContent(privacyHTML);

        // Fetch Cookie Policy
        const cookieStorageRef = ref(storage, "policies/cookiespolicy.html");
        const cookieURL = await getDownloadURL(cookieStorageRef);
        const cookieResponse = await fetch(cookieURL);
        if (!cookieResponse.ok) {
          throw new Error(`HTTP error! status: ${cookieResponse.status}`);
        }
        const cookieHTML = await cookieResponse.text();
        setCookieContent(cookieHTML);
      } catch (error) {
        console.error("Error fetching policies:", error);
        setError(
          "Could not load policies. Please check your internet connection and try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, []);
  const handlePolicyClick = (policyType) => {
    setActivePolicy(policyType);
  };
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-4xl w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Our Policies
        </h1>

        <div className="mb-6 flex justify-center gap-4">
          <button
            className={classNames(
              "py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105",
              activePolicy === "terms"
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
            onClick={() => handlePolicyClick("terms")}
            disabled={isLoading}
          >
            Terms and Conditions
          </button>
          <button
            className={classNames(
              "py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105",
              activePolicy === "privacy"
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
            onClick={() => handlePolicyClick("privacy")}
            disabled={isLoading}
          >
            Privacy Policy
          </button>
          <button
            className={classNames(
              "py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105",
              activePolicy === "cookie"
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
            onClick={() => handlePolicyClick("cookie")}
            disabled={isLoading}
          >
            Cookie Policy
          </button>
        </div>
        {isLoading && <p className="text-center">Loading policies...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Terms and Conditions */}
        {activePolicy === "terms" && termsContent && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Terms and Conditions</h2>
            <div
              dangerouslySetInnerHTML={{ __html: termsContent }}
              className="policy-content"
            />
          </div>
        )}

        {/* Privacy Policy */}
        {activePolicy === "privacy" && privacyContent && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Privacy Policy</h2>
            <div
              dangerouslySetInnerHTML={{ __html: privacyContent }}
              className="policy-content"
            />
          </div>
        )}

        {/* Cookie Policy */}
        {activePolicy === "cookie" && cookieContent && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Cookie Policy</h2>
            <div
              dangerouslySetInnerHTML={{ __html: cookieContent }}
              className="policy-content"
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default PoliciesPage;
