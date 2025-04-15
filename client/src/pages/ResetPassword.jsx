"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null); 
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const validateToken = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        await axios.get(`http://localhost:5000/api/auth/validate-reset-token/${token}`);
        setIsTokenValid(true);
      } catch (error) {
        setIsTokenValid(false);
        toast.error(
          "This reset link is invalid or has expired. Please request a new one.",
          { autoClose: 5000 }
        );
      }
    };
    validateToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password: formData.password,
      });
      toast.success("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white text-lg">Checking reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      <ToastContainer />
      {/* Previous Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center text-gray-400 hover:text-white bg-gray-800 p-2 rounded-md z-50 sm:top-6 sm:left-6"
      >
        <FaArrowLeft className="mr-2" />
        <span className="text-sm font-medium">Previous</span>
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
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400 md:text-gray-600">
            {isTokenValid
              ? "Enter your new password below."
              : "This link has expired. Please request a new one."}
          </p>
        </div>

        {isTokenValid ? (
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-gray-800 md:bg-white py-8 px-4 shadow-lg rounded-xl sm:rounded-2xl sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 md:text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border-0 rounded-lg shadow-inner bg-gray-700 md:bg-white text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition duration-200"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 md:text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border-0 rounded-lg shadow-inner bg-gray-700 md:bg-white text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition duration-200"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border-0 rounded-lg shadow-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-gray-800 md:bg-white py-8 px-4 shadow-lg rounded-xl sm:rounded-2xl sm:px-10 text-center">
              <p className="text-gray-300 md:text-gray-700 mb-4">
                The reset link you used has expired or is invalid.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block py-3 px-4 border-0 rounded-lg shadow-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >
                Request a New Link
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;