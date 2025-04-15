"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
    }
  }, [location.search]);

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await axios.post("https://personal-jpgy.onrender.com/api/auth/register", formData);
        localStorage.setItem("token", response.data.token);
        toast.success("Registered successfully! Redirecting to login...", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } catch (error) {
        if (error.response && error.response.data) {
          setErrors({ ...errors, server: error.response.data.message });
        } else {
          setErrors({ ...errors, server: "Something went wrong. Please try again." });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center text-gray-400 hover:text-white bg-gray-800 p-2 rounded-md z-50 sm:top-6 sm:left-6"
      >
        <FaArrowLeft className="mr-2" />
        <span className="text-sm font-medium">Previous</span>
      </button>
      <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center items-center">
        <h1 className="text-5xl font-extrabold">InvestDaily</h1>
        <p className="mt-4 text-lg text-gray-400">Your trusted investment platform</p>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-16 bg-gray-900 md:bg-gray-100 relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white md:text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-400 md:text-gray-600">
            Or{" "}
            <Link to="/signin" className="font-medium text-indigo-500 hover:text-indigo-400">
              sign in to your account
            </Link>
          </p>
        </div>
        <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 md:bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-lg rounded-xl sm:rounded-2xl">
            {errors.server && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">{errors.server}</div>
            )}
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300 md:text-gray-700">
                  Name
                </label>
                <div className="mt-1 sm:mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 sm:px-4 py-2 sm:py-3 border-0 rounded-lg shadow-inner ${
                      errors.name ? "bg-red-50" : "bg-gray-700 md:bg-white"
                    } text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm sm:text-base`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 md:text-gray-700">
                  Email address
                </label>
                <div className="mt-1 sm:mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 sm:px-4 py-2 sm:py-3 border-0 rounded-lg shadow-inner ${
                      errors.email ? "bg-red-50" : "bg-gray-700 md:bg-white"
                    } text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm sm:text-base`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 md:text-gray-700">
                  Password
                </label>
                <div className="mt-1 sm:mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 sm:px-4 py-2 sm:py-3 border-0 rounded-lg shadow-inner ${
                      errors.password ? "bg-red-50" : "bg-gray-700 md:bg-white"
                    } text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm sm:text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition duration-200"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="referralCode" className="block text-xs sm:text-sm font-medium text-gray-300 md:text-gray-700">
                  Referral Code (Optional)
                </label>
                <div className="mt-1 sm:mt-2">
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    placeholder="Enter referral code"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 sm:px-4 py-2 sm:py-3 border-0 rounded-lg shadow-inner bg-gray-700 md:bg-white text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-xs sm:text-sm text-gray-400 md:text-gray-700">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-indigo-500 hover:text-indigo-400 underline"
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>
              {errors.terms && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.terms}</p>}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 sm:py-3 px-4 rounded-lg shadow-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 text-sm sm:text-base"
                >
                  {loading ? "Signing up..." : "Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showTerms && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-4">Terms and Conditions</h3>
            <div className="text-sm text-gray-500 space-y-2 sm:space-y-4">
              <p>1. Welcome to InvestDaily! By signing up, you agree to our Terms of Service and Privacy Policy.</p>
              <p>2. You must be at least 18 years old to use our services.</p>
              <p>3. All investments carry risk. Past performance is not indicative of future results.</p>
              <p>4. You are responsible for maintaining the confidentiality of your account credentials.</p>
              <p>5. We reserve the right to suspend or terminate accounts that violate our terms.</p>
              <p>6. Payments are processed securely through our payment partners.</p>
              <p>7. Withdrawals are subject to our withdrawal policy and schedule.</p>
              <p>8. The referral program is subject to our referral terms and conditions.</p>
              <p>9. Daily returns are credited to your account as per the plan schedule.</p>
              <p>10. We may update our terms and conditions from time to time.</p>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowTerms(false)}
                className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default SignUp;
