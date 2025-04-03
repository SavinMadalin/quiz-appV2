// src/Spinner.js
import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-light-blue-matte dark:border-blue-400"></div>
    </div>
  );
};

export default Spinner;
