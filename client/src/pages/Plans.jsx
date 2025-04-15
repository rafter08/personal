"use client";

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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

const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleBuyPlan = (plan) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    navigate(`/payment/${selectedPlan.id}`);
  };

  const calculateTotalReturn = (dailyReturn, days) => {
    return dailyReturn * days;
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight">Investment Plans</h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-400">
            Choose the plan that fits your investment goals and start earning daily returns.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {planData.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 ${
                selectedPlan?.id === plan.id ? "ring-2 ring-indigo-600" : ""
              }`}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline text-indigo-400">
                  <span className="text-4xl font-extrabold">₹{plan.price}</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">One-time investment</p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-3 text-gray-300">
                      ₹{plan.dailyReturn}/day for {plan.days} days
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-3 text-gray-300">
                      Total return: ₹{calculateTotalReturn(plan.dailyReturn, plan.days)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-3 text-gray-300">Withdraw every 3 days</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyPlan(plan)}
                  disabled={!user}
                  className={`mt-8 block w-full font-semibold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    !user
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {user ? "Buy Plan" : "Sign in to Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 text-gray-200 rounded-lg p-4 w-full max-w-sm sm:max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">{selectedPlan.name} Plan Details</h3>

            <div className="space-y-4 mb-4">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-medium">Investment Amount:</span>
                <span className="font-bold">₹{selectedPlan.price}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-medium">Daily Return:</span>
                <span className="font-bold">₹{selectedPlan.dailyReturn}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-medium">Duration:</span>
                <span className="font-bold">{selectedPlan.days} days</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-medium">Total Return:</span>
                <span className="font-bold">₹{calculateTotalReturn(selectedPlan.dailyReturn, selectedPlan.days)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-medium">Net Profit:</span>
                <span className="font-bold text-green-400">
                  ₹{calculateTotalReturn(selectedPlan.dailyReturn, selectedPlan.days) - selectedPlan.price}
                </span>
              </div>
            </div>

            <div className="bg-gray-700 p-3 rounded-lg mb-4">
              <h4 className="font-bold mb-2">Advantages:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>Daily earnings credited automatically</li>
                <li>Withdraw earnings every 3 days</li>
                <li>No hidden fees or charges</li>
                <li>Access to referral program</li>
                <li>24/7 customer support</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-3 py-2 border border-gray-500 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                disabled={!user}
                className={`px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  !user
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {user ? "Buy this Plan" : "Sign in to Buy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;