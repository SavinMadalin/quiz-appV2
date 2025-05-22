// src/MainPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector to get auth state
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import {
  CheckCircleIcon,
  LightBulbIcon,
  ArrowRightIcon as OutlineArrowRightIcon,
  UserPlusIcon,
  EnvelopeIcon, // For resend email
  AcademicCapIcon, // For premium benefit
  SparklesIcon, // For premium benefit
  BoltIcon, // For premium benefit
  ShieldCheckIcon,
} from "@heroicons/react/24/outline"; // Changed to outline for consistency
import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid"; // For subscribe button
import { storage, resendVerificationEmail } from "./firebase"; // Import storage and resendVerificationEmail
import { ref, getDownloadURL } from "firebase/storage"; // Import storage functions
import Spinner from "./Spinner"; // Import Spinner
import { useSubscription } from "./contexts/SubscriptionContext"; // Import useSubscription

const EmailSentPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  // console.log("EmailSentPopup rendered"); // Keep for debugging if needed
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-md shadow-lg z-50 flex items-center gap-2">
      <CheckCircleIcon className="h-6 w-6" />
      Verification email sent!
    </div>
  );
};

const premiumBenefits = [
  {
    name: "Unlock All Categories & Questions",
    description:
      "Dive deep into specialized topics with our full question bank.",
    icon: SparklesIcon,
  },
  {
    name: "Master Interview Mode",
    description:
      "Simulate real interview scenarios and get AI-powered feedback.",
    icon: AcademicCapIcon,
  },
  {
    name: "Personalized Feedback",
    description: "Receive tailored advice to sharpen your skills effectively.",
    icon: BoltIcon,
  },
  {
    name: "Priority Support",
    description: "Get your queries resolved faster with our dedicated support.",
    icon: ShieldCheckIcon,
  },
];

const MainPage = ({ setEmailSent }) => {
  // Receive setEmailSent as a prop
  const location = useLocation();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [randomTip, setRandomTip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tipsAndTricks, setTipsAndTricks] = useState([]);
  const [emailResendError, setEmailResendError] = useState(null);
  const [emailResendSuccess, setEmailResendSuccess] = useState(false);

  const { isAuthenticated, isEmailVerified } = useSelector(
    (state) => state.user
  );
  const { isPremium, isLoadingStatus: isLoadingSubscription } =
    useSubscription(); // Get isPremium

  useEffect(() => {
    if (location.state?.isEmailSent) {
      setShowPopup(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  useEffect(() => {
    const fetchTipsAndTricks = async () => {
      setIsLoading(true);
      try {
        const storageRef = ref(storage, "tips/tips.json");
        const url = await getDownloadURL(storageRef);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch tips");
        const data = await response.json();
        setTipsAndTricks(data);
      } catch (error) {
        console.error("Error fetching tips and tricks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTipsAndTricks();
  }, []);

  useEffect(() => {
    if (tipsAndTricks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tipsAndTricks.length);
      setRandomTip(tipsAndTricks[randomIndex]);
    }
  }, [tipsAndTricks]);
  const handleResendEmail = async () => {
    setEmailResendError(null);
    setEmailResendSuccess(false);
    try {
      await resendVerificationEmail();
      setEmailSent(true); // Notify AppContent to start polling
      setEmailResendSuccess(true);
      setTimeout(() => {
        setEmailResendSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error resending verification email:", err);
      setEmailResendError("Wait at least 1 minute before resending the email.");
      setTimeout(() => {
        setEmailResendError(null);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      {showPopup && <EmailSentPopup onClose={() => setShowPopup(false)} />}
      <section className="bg-white dark:bg-dark-grey p-6 sm:p-8 rounded-lg shadow-lg max-w-4xl w-full mt-8 mb-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-3">
            <span className="text-yellow-400">Dev</span>
            <span className="text-black dark:text-white">Prep</span>
          </h1>
          <p className="text-base sm:text-lg mb-6">
            Ace your tech interviews with our targeted quizzes and expert tips.
          </p>

          {/* Buttons Section */}
          <div className="flex flex-col items-center gap-4 my-8">
            {/* Sign up for free Button */}
            {!isAuthenticated && (
              <Link
                to="/register"
                className="w-full max-w-xs inline-flex items-center justify-center px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                <UserPlusIcon className="mr-2 h-6 w-6" /> Sign up for free
                {/* Changed Icon and added mr-2 */}
              </Link>
            )}

            {/* Start your dev prep journey Button */}
            <Link
              to="/quiz-config"
              className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 text-lg rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              Start your DevPrep journey
              <OutlineArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>

            {isAuthenticated &&
              !isPremium &&
              !isLoadingSubscription &&
              (isEmailVerified ? (
                <Link
                  to="/subscription"
                  className="w-full max-w-xs bg-gray-700 hover:bg-gray-900 text-yellow-300 font-bold py-3 px-6 text-lg rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                >
                  <SolidStarIcon className="mr-2 h-5 w-5" />
                  Subscribe for premium
                </Link>
              ) : (
                <div className="w-full max-w-xs flex flex-col items-center">
                  <button
                    onClick={handleResendEmail}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 text-lg rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                  >
                    <EnvelopeIcon className="mr-2 h-6 w-6" />
                    Resend Confirmation Email
                  </button>
                  {emailResendSuccess && (
                    <p className="text-green-500 text-sm mt-2">
                      Verification email sent!
                    </p>
                  )}
                  {emailResendError && (
                    <p className="text-red-500 text-sm mt-2">
                      {emailResendError}
                    </p>
                  )}
                </div>
              ))}
            {isAuthenticated && !isPremium && isLoadingSubscription && (
              <div className="w-full max-w-xs h-[54px] flex justify-center items-center">
                {" "}
                {/* Match button height */}
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </section>
      {randomTip && !isLoading && (
        <section className="max-w-4xl w-full mb-8">
          <div className="bg-white dark:bg-dark-grey p-6 sm:p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <LightBulbIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mr-2" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                Tip & Trick
              </h2>
            </div>
            <div className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-semibold text-base sm:text-lg mb-1">
                {randomTip.title}
              </h3>
              <p className="text-xs sm:text-sm mb-1">{randomTip.description}</p>
              <a
                href={randomTip.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs sm:text-sm"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      )}
      {isLoading && !randomTip && <Spinner />}{" "}
      {/* Show spinner if tips are loading and no tip is yet available */}
      <section className="max-w-4xl w-full mb-8">
        <div className="bg-white dark:bg-dark-grey p-6 sm:p-8 rounded-lg shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
              <SolidStarIcon className="h-7 w-7 text-yellow-300" />
              Unlock DevPrep Premium
            </h2>
            <p className="text-sm sm:text-base mt-2 text-blue-500">
              Elevate your preparation to the next level.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {premiumBenefits.map((benefit) => (
              <div
                key={benefit.name}
                className="border rounded-lg flex items-start gap-3 p-3 dark:bg-white/10 bg-gray-100 rounded-lg"
              >
                <benefit.icon className="h-6 w-6 text-yellow-300 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">
                    {benefit.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/subscription"
              className="inline-flex items-center justify-center px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-lg font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
            >
              View Premium Plans{" "}
              <OutlineArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      <Navbar />
    </div>
  );
};

export default MainPage;
