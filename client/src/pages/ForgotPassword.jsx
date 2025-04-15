// pages/ForgotPassword.jsx
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      toast.success("Reset link sent to your email! It’s valid for 10 minutes.");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <ToastContainer />
      {/* Previous Button */}
      <button
        onClick={() => navigate("/signin")}
        className="absolute top-4 left-4 flex items-center text-gray-400 hover:text-white bg-gray-800 p-2 rounded-md z-50 sm:top-6 sm:left-6"
      >
        <FaArrowLeft className="mr-2" />
        <span className="text-sm font-medium">Back to Sign In</span>
      </button>

      {/* Left Half */}
      <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center items-center">
        <h1 className="text-5xl font-extrabold">InvestDaily</h1>
        <p className="mt-4 text-lg text-gray-400">Your trusted investment platform</p>
      </div>

      {/* Right Half */}
      <div className="w-full md:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 bg-gray-900 md:bg-gray-100 relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-white md:text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400 md:text-gray-600">
            Enter your email to receive a reset link. The link will be valid for 10 minutes.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 md:bg-white py-8 px-4 shadow-lg rounded-xl sm:rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 md:text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border-0 rounded-lg shadow-inner bg-gray-700 md:bg-white text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border-0 rounded-lg shadow-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;