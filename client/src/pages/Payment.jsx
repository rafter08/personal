"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const planData = [
  { id: 1, price: 299, dailyReturn: 20, days: 30, name: "Starter" },
  { id: 2, price: 499, dailyReturn: 35, days: 30, name: "Basic" },
  { id: 3, price: 999, dailyReturn: 60, days: 30, name: "Standard" },
  { id: 4, price: 1999, dailyReturn: 120, days: 30, name: "Premium" },
  { id: 5, price: 3499, dailyReturn: 200, days: 30, name: "Gold" },
  { id: 6, price: 4999, dailyReturn: 300, days: 30, name: "Platinum" },
  { id: 7, price: 9999, dailyReturn: 500, days: 30, name: "Diamond" },
];

const Payment = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false); 
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    const selectedPlan = planData.find((p) => p.id === Number.parseInt(planId));
    if (!selectedPlan) {
      navigate("/plans");
      return;
    }

    setPlan(selectedPlan);
  }, [planId, navigate, user]);

  const handleUpiChange = (e) => {
    setUpiId(e.target.value);
    setError("");
  };

  const validateUpiId = (upi) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upi);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!upiId.trim()) {
      setError("Please enter your UPI ID");
      return;
    }

    if (!validateUpiId(upiId)) {
      setError("Please enter a valid UPI ID");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await axios.post(
        "https://personal-jpgy.onrender.com/api/plans/purchase",
        {
          planId: plan.id,
          amount: plan.price,
          paymentMethod: "UPI",
          paymentId: `UPI_${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setShowSuccess(true);

      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError("Payment failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="spinner-border text-indigo-600" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Go Back Button with Custom Confirmation */}
      <button
        onClick={() => setShowConfirmBack(true)}
        className="absolute top-4 left-4 flex items-center text-gray-400 hover:text-white bg-gray-800 p-2 rounded-md md:p-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Go Back</span>
      </button>

      {/* Custom Confirmation Modal */}
      {showConfirmBack && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-2 sm:mx-0">
            <h3 className="text-lg font-medium text-white mb-2">Confirm Action</h3>
            <p className="text-gray-400 mb-4 text-sm">Are you sure you want to go back? Any unsaved changes will be lost.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmBack(false)}
                className="px-3 py-1 text-sm font-medium text-gray-400 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmBack(false);
                  navigate(-1);
                }}
                className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {showSuccess ? (
          <div className="p-4 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="mt-3 text-xl font-medium text-white">Congratulations!</h3>
            <p className="mt-2 text-gray-400 text-sm">
              Your {plan.name} plan has been activated successfully. Your daily earnings will start from tomorrow.
            </p>
            <p className="mt-2 text-sm text-gray-500">Redirecting to your profile...</p>
          </div>
        ) : (
          <>
            <div className="bg-indigo-600 px-4 py-3 sm:py-4">
              <h3 className="text-lg font-medium leading-6 text-white">Payment Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-indigo-200">Complete your payment to activate your plan.</p>
            </div>

            <div className="border-t border-gray-700 px-4 py-3 sm:p-4">
              <div className="mb-3 sm:mb-4">
                <h4 className="text-lg font-medium text-white">Order Summary</h4>
                <div className="mt-2 flex justify-between border-b border-gray-700 pb-1 sm:pb-2">
                  <span className="text-gray-400 text-sm">Plan:</span>
                  <span className="font-medium text-white text-sm">{plan.name}</span>
                </div>
                <div className="mt-1 flex justify-between border-b border-gray-700 pb-1 sm:pb-2">
                  <span className="text-gray-400 text-sm">Amount:</span>
                  <span className="font-medium text-white text-sm">₹{plan.price}</span>
                </div>
                <div className="mt-1 flex justify-between border-b border-gray-700 pb-1 sm:pb-2">
                  <span className="text-gray-400 text-sm">Daily Return:</span>
                  <span className="font-medium text-white text-sm">
                    ₹{plan.dailyReturn} for {plan.days} days
                  </span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-gray-400 text-sm">Total Return:</span>
                  <span className="font-medium text-green-400 text-sm">₹{plan.dailyReturn * plan.days}</span>
                </div>
              </div>

              <form onSubmit={handlePayment}>
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-lg font-medium text-white">Payment Method</h4>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <input
                        id="upi"
                        name="paymentMethod"
                        type="radio"
                        checked
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label htmlFor="upi" className="ml-3 block text-sm font-medium text-gray-400">
                        UPI Payment
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <label htmlFor="upiId" className="block text-sm font-medium text-white">
                    Enter your UPI ID
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="upiId"
                      id="upiId"
                      value={upiId}
                      onChange={handleUpiChange}
                      placeholder="yourname@upi"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 bg-gray-900 text-gray-300 rounded-md py-2 px-3 placeholder-gray-400"
                    />
                  </div>
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? "Processing..." : `Pay ₹${plan.price}`}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Payment;
