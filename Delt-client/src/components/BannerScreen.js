import React, { useState } from 'react';

// ErrorBanner Component
const ErrorBanner = ({ message }) => (
  <div className="bg-red-100 text-red-800 border border-red-300 rounded-md p-4 mb-4">
    <p>{message || "An error has occurred!"}</p>
  </div>
);

// SuccessBanner Component
const SuccessBanner = ({ message }) => (
  <div className="bg-green-100 text-green-800 border border-green-300 rounded-md p-4 mb-4">
    <p>{message || "Action was successful!"}</p>
  </div>
);

// Main Screen Component
const BannerScreen = () => {
  const [showError, setShowError] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {showError ? (
        <ErrorBanner message="Oops! Something went wrong." />
      ) : (
        <SuccessBanner message="Hooray! Everything is working fine." />
      )}
      <button
        onClick={() => setShowError(!showError)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Toggle Banner
      </button>
    </div>
  );
};

export default BannerScreen;
