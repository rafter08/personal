"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Profile = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [userPlans, setUserPlans] = useState([]);
  const [wallet, setWallet] = useState({
    totalEarnings: 0,
    balance: 0,
    withdrawable: 0,
    transactions: [],
  });
  const [referrals, setReferrals] = useState({ code: "", referredUsers: [] });
  const [milestones, setMilestones] = useState({
    tier1: { users: 0, targetUsers: 10, bonus: 750, achieved: false },
    tier2: { users: 0, targetUsers: 25, bonus: 1500, achieved: false },
  });
  const [loading, setLoading] = useState(true);
  const [withdrawalRequested, setWithdrawalRequested] = useState(false);
  const navigate = useNavigate();
  const fetchedTabs = useRef({});

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [plansResponse, walletResponse, referralsResponse, milestonesResponse] = await Promise.all([
        axios.get("https://personal-jpgy.onrender.com/api/plans/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).catch(() => ({ data: [] })),
        axios.get("https://personal-jpgy.onrender.com/api/wallet", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).catch(() => ({ data: { totalEarnings: 0, balance: 0, withdrawable: 0, transactions: [] } })),
        axios.get("https://personal-jpgy.onrender.com/api/referrals", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).catch((err) => {
          console.error("Referral fetch failed:", err.message);
          return { data: { code: "", referredUsers: [] } };
        }),
        axios.get("https://personal-jpgy.onrender.com/api/referrals/milestones", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).catch(() => ({
          data: {
            tier1: { users: 0, targetUsers: 10, bonus: 750, achieved: false },
            tier2: { users: 0, targetUsers: 25, bonus: 1500, achieved: false },
          },
        })),
      ]);

      setUserPlans(plansResponse.data);
      setWallet(walletResponse.data);
      setReferrals(referralsResponse.data);
      setMilestones(milestonesResponse.data);

      if (!referralsResponse.data.code && plansResponse.data.length > 0) {
        try {
          const userResponse = await axios.get("https://personal-jpgy.onrender.com/api/users/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (userResponse.data.referralCode) {
            setReferrals((prev) => ({ ...prev, code: userResponse.data.referralCode }));
          }
        } catch (err) {
          console.error("Error fetching user referral code:", err.message);
        }
      }

      console.log("Fetched profile data:", {
        plans: plansResponse.data.length,
        referrals: referralsResponse.data,
      });
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (!authLoading && user) {
      fetchedTabs.current = {};
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && ["wallet", "referrals", "milestones"].includes(activeTab)) {
      const tabKey = `${activeTab}-${user._id}`;
      if (fetchedTabs.current[tabKey]) {
        return;
      }
      const fetchData = async () => {
        try {
          const requests = [];
          if (activeTab === "wallet") {
            requests.push(
              axios.get("https://personal-jpgy.onrender.com/api/wallet", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              })
            );
          }
          if (activeTab === "referrals") {
            requests.push(
              axios.get("https://personal-jpgy.onrender.com/api/referrals", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              })
            );
          }
          if (activeTab === "milestones") {
            requests.push(
              axios.get("https://personal-jpgy.onrender.com/api/referrals/milestones", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              })
            );
          }

          const responses = await Promise.all(requests);
          const prevMilestones = milestones;

          if (activeTab === "wallet") {
            setWallet(responses[0].data);
          }
          if (activeTab === "referrals") {
            setReferrals(responses[0].data);
            if (!responses[0].data.code && userPlans.length > 0) {
              try {
                const userResponse = await axios.get("https://personal-jpgy.onrender.com/api/users/me", {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (userResponse.data.referralCode) {
                  setReferrals((prev) => ({ ...prev, code: userResponse.data.referralCode }));
                }
              } catch (err) {
                console.error("Error fetching user referral code:", err.message);
              }
            }
          }
          if (activeTab === "milestones") {
            setMilestones(responses[0].data);
            if (
              prevMilestones?.tier1 &&
              !prevMilestones.tier1.achieved &&
              responses[0].data.tier1?.achieved
            ) {
              toast.success(
                `🎉 Milestone Achieved! ₹${responses[0].data.tier1.bonus} added for Tier 1 (${responses[0].data.tier1.users} referrals).`,
                { autoClose: 5000 }
              );
            }
            if (
              prevMilestones?.tier2 &&
              !prevMilestones.tier2.achieved &&
              responses[0].data.tier2?.achieved
            ) {
              toast.success(
                `🎉 Milestone Achieved! ₹${responses[0].data.tier2.bonus} added for Tier 2 (${responses[0].data.tier2.users} referrals).`,
                { autoClose: 5000 }
              );
            }
          }
          fetchedTabs.current[tabKey] = true;
        } catch (error) {
          console.error(`Error refreshing ${activeTab} data:`, error.message);
          toast.error(`Failed to refresh ${activeTab} data.`);
          if (activeTab === "wallet") {
            setWallet({ totalEarnings: 0, balance: 0, withdrawable: 0, transactions: [] });
          }
        }
      };
      fetchData();
    }
  }, [activeTab, authLoading, user?._id, userPlans.length]);

  const handleWithdraw = async () => {
    try {
      if (wallet.withdrawable < 100) {
        toast.error("Minimum withdrawal amount is ₹100");
        return;
      }
      await axios.post(
        "https://personal-jpgy.onrender.com/api/wallet/withdraw",
        { amount: wallet.withdrawable },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      setWithdrawalRequested(true);
      toast.success("Withdrawal request submitted successfully");
      const walletResponse = await axios.get("https://personal-jpgy.onrender.com/api/wallet", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWallet(walletResponse.data);
      setTimeout(() => setWithdrawalRequested(false), 3000);
    } catch (error) {
      console.error("Error requesting withdrawal:", error.message);
      toast.error(error.response?.data?.message || "Failed to request withdrawal");
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referrals.code}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-opacity-75 mb-4"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white">User Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">Manage your account, plans, and earnings.</p>
          </div>

          <div className="border-b border-gray-700">
            <nav className="flex overflow-x-auto sm:flex-row sm:space-x-8">
              {["profile", "plans", "wallet", "referrals", "milestones"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                  } whitespace-nowrap py-4 px-4 sm:px-6 border-b-2 font-medium text-sm sm:text-base capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === "profile" && (
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">Full name</dt>
                  <dd className="mt-1 text-sm text-white">{user.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">Email address</dt>
                  <dd className="mt-1 text-sm text-white">{user.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">Member since</dt>
                  <dd className="mt-1 text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">Account status</dt>
                  <dd className="mt-1 text-sm text-white">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {activeTab === "plans" && (
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-lg font-medium text-white mb-4">My Investment Plans</h4>
              {userPlans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You haven't purchased any plans yet.</p>
                  <button
                    onClick={() => navigate("/plans")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Plans
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                          Plan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                          Purchase Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                          Daily Return
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                          Days Remaining
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {userPlans.map((plan) => (
                        <tr key={plan._id}>
                          <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                            <div className="text-sm font-medium text-white">{plan.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                            <div className="text-sm text-gray-400">
                              {new Date(plan.purchaseDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                            <div className="text-sm text-white">₹{plan.dailyReturn}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                            <div className="text-sm text-white">{plan.daysRemaining}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-lg font-medium text-white mb-4">My Wallet</h4>
              <div className="mb-4">
                <button
                  onClick={async () => {
                    try {
                      const walletResponse = await axios.get("https://personal-jpgy.onrender.com/api/wallet", {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                      });
                      setWallet(walletResponse.data);
                      toast.success("Wallet refreshed!", { autoClose: 3000 });
                    } catch (error) {
                      console.error("Error refreshing wallet:", error.message);
                      toast.error("Failed to refresh wallet data.");
                      setWallet({ totalEarnings: 0, balance: 0, withdrawable: 0, transactions: [] });
                    }
                  }}
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm sm:text-base"
                >
                  Refresh Wallet
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
                <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-400 truncate">Lifetime Earnings</dt>
                    <dd className="mt-1 text-2xl font-semibold text-white sm:text-3xl">₹{wallet.totalEarnings}</dd>
                  </div>
                </div>
                <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-400 truncate">Balance</dt>
                    <dd className="mt-1 text-2xl font-semibold text-white sm:text-3xl">₹{wallet.balance}</dd>
                  </div>
                </div>
                <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-400 truncate">Withdrawable Amount</dt>
                    <dd className="mt-1 text-2xl font-semibold text-white sm:text-3xl">₹{wallet.withdrawable}</dd>
                  </div>
                </div>
              </div>
              {withdrawalRequested ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Your withdrawal request has been submitted successfully. The amount will be credited to your account within
                        24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              ) : wallet.withdrawable >= 100 ? (
                <button
                  onClick={handleWithdraw}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 sm:text-base"
                >
                  Withdraw ₹{wallet.withdrawable}
                </button>
              ) : (
                <p className="text-sm text-yellow-400 mt-4">Insufficient withdrawable amount (minimum ₹100 required).</p>
              )}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-400 mb-3">Withdrawal Rules:</h5>
                <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                  <li>Minimum withdrawal amount: ₹100</li>
                  <li>Withdrawals are processed within 24 hours</li>
                  <li>Earnings are calculated and added to your wallet daily</li>
                </ul>
              </div>
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-400 mb-3">Recent Transactions:</h5>
                {wallet.transactions && wallet.transactions.length > 0 ? (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {wallet.transactions.map((transaction) => (
                          <tr key={transaction._id || Math.random()}>
                            <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                              <div className="text-sm text-gray-400">
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                              <div className="text-sm text-white">
                                {transaction.type === "Refund" || (transaction.type === "Earning" && !transaction.planId)
                                  ? "Refund"
                                  : transaction.type}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                              <div className="text-sm text-white">₹{transaction.amount}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  transaction.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : transaction.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No transactions yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "referrals" && (
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-lg font-medium text-white mb-4">My Referrals</h4>
              {!referrals.code ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        You need to purchase at least one plan to get your referral code.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-indigo-50 p-6 rounded-lg mb-6">
                    <h5 className="text-lg font-medium text-indigo-900 mb-2">Your Referral Code</h5>
                    <div className="flex items-center flex-wrap sm:flex-nowrap">
                      <span className="text-2xl font-bold text-indigo-700 mr-3 mb-2 sm:mb-0">{referrals.code}</span>
                      <button
                        onClick={copyReferralLink}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        Copy Link
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-indigo-600">
                      Share this code with your friends. When they sign up and purchase a plan, you'll earn ₹200!
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          ></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-lg font-medium text-green-800">Refer friends and earn ₹200!</h5>
                        <p className="text-sm text-green-600">
                          For each friend who signs up using your referral code and purchases a plan, you'll receive ₹200
                          in your wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                  <h5 className="text-md font-medium text-gray-400 mb-3">Your Referrals:</h5>
                  {referrals.referredUsers && referrals.referredUsers.length > 0 ? (
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                              Joined Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                              Plans Purchased
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sm:px-6 sm:text-sm">
                              Bonus Earned
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                          {referrals.referredUsers.map((user) => (
                            <tr key={user._id}>
                              <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                                <div className="text-sm font-medium text-white">{user.name}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                                <div className="text-sm text-gray-400">
                                  {new Date(user.joinedDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                                <div className="text-sm text-white">{user.plansCount}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                                <div className="text-sm text-white">₹{user.bonusEarned}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">You haven't referred anyone yet.</p>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "milestones" && (
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-lg font-medium text-white mb-4">Referral Milestones</h4>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {["tier1", "tier2"].map((tier) => (
                  <div key={tier} className="bg-gray-800 p-6 rounded-lg shadow">
                    <h5 className="text-md font-medium text-white mb-4">
                      {tier === "tier1" ? "Tier 1 Milestone" : "Tier 2 Milestone"}
                    </h5>
                    {milestones[tier].achieved ? (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                          <svg
                            className="h-12 w-12 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-400">
                          🎉 Achieved! ₹{milestones[tier].bonus} earned for {milestones[tier].users} referrals.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Referred Users: {milestones[tier].users}/{milestones[tier].targetUsers}</p>
                        <div className="w-24 h-24 mx-auto">
                          <CircularProgressbar
                            value={(milestones[tier].users / milestones[tier].targetUsers) * 100}
                            text={`${milestones[tier].users}/${milestones[tier].targetUsers}`}
                            styles={buildStyles({
                              pathColor: "#4f46e5",
                              textColor: "#ffffff",
                              trailColor: "#4b5563",
                            })}
                          />
                        </div>
                        <p className="text-sm text-indigo-400 text-center mt-4">
                          Bonus: ₹{milestones[tier].bonus}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;