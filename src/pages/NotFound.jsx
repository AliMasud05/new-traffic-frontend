import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the external URL after a short delay
    const timer = setTimeout(() => {
      window.location.href = "https://avtoskola-varketilshi.ge/not-found";
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600">
        Redirecting to <a href="https://avtoskola-varketilshi.ge/not-fount" className="text-blue-500 underline">avtoskola-varketilshi.ge</a>...
      </p>
    </div>
  );
};

export default NotFound;