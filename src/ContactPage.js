// src/ContactPage.js
import React from "react";
import TopNavbar from "./components/TopNavbar";
import Navbar from "./Navbar";
import { EnvelopeIcon, LifebuoyIcon } from "@heroicons/react/24/outline";

const ContactPage = () => {
  const supportEmail = "java.world307@gmail.com";

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2 text-gray-800 dark:text-white">
          <LifebuoyIcon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500" />
          Contact Support
        </h1>

        <div className="text-center mb-6">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
            Have questions or need assistance? We're here to help!
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Please reach out to us via email:
          </p>
        </div>

        <div className="flex justify-center items-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-2 border-indigo-200 dark:border-indigo-700">
          <EnvelopeIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mr-3 flex-shrink-0" />
          <a
            href={`mailto:${supportEmail}`}
            className="text-lg sm:text-xl font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 break-all"
          >
            {supportEmail}
          </a>
        </div>

        <p className="mt-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
          We typically respond within 24-48 business hours.
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
