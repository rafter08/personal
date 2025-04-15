"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalPlans: 0, totalProfit: 0, dailyProfit: 0 });

  const [editingUser, setEditingUser] = useState(null);
  const [userEditData, setUserEditData] = useState({ name: "", email: "", password: "", isAdmin: false });
  const [editingPlan, setEditingPlan] = useState(null);
  const [planEditData, setPlanEditData] = useState({ userEmail: "", name: "", amount: "", dailyReturn: "", days: "", status: "" });
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailType, setDetailType] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData(false);
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async (showToast = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const usersResponse = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersResponse.data);

      const plansResponse = await axios.get("http://localhost:5000/api/admin/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(plansResponse.data);

      const withdrawalsResponse = await axios.get("http://localhost:5000/api/admin/withdrawals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawals(withdrawalsResponse.data);

      const statsResponse = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsResponse.data);

      if (activeTab === "audit") {
        const auditResponse = await axios.get("http://localhost:5000/api/admin/audit-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuditLogs(auditResponse.data);
      }
      if (showToast) {
        toast.success("Data refreshed successfully!", { autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError(error.response?.data?.message || "Failed to fetch data");
      if (showToast) {
        toast.error(error.response?.data?.message || "Failed to load data", { autoClose: 3000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const loginToast = toast.info("Logging in...", { autoClose: false });

    try {
      const response = await axios.post("http://localhost:5000/api/auth/admin-login", {
        email,
        password,
      });
      if (response.data.isAdmin) {
        const token = response.data.token;
        if (!token) {
          setError("Login failed: No token returned by server");
          toast.dismiss(loginToast);
          toast.error("Login failed: No token returned by server", { autoClose: 3000 });
          return;
        }
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        toast.dismiss(loginToast);
        toast.success("Login successful!", { autoClose: 3000 });
      } else {
        setError("Access Denied: You are not an admin.");
        toast.dismiss(loginToast);
        toast.error("Access Denied: You are not an admin.", { autoClose: 3000 });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      toast.dismiss(loginToast);
      toast.error(err.response?.data?.message || "Invalid credentials", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    setError("");
    toast.info("Logged out successfully!", { autoClose: 3000 });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${editingUser._id}`,
        userEditData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUsers(users.map((u) => (u._id === editingUser._id ? response.data : u)));
      toast.success("User updated successfully!", { autoClose: 3000 });
      setEditingUser(null);
      setUserEditData({ name: "", email: "", password: "", isAdmin: false });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user");
      toast.error(error.response?.data?.message || "Failed to update user", { autoClose: 3000 });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((u) => u._id !== userId));
        toast.success("User deleted successfully!", { autoClose: 3000 });
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete user");
        toast.error(error.response?.data?.message || "Failed to delete user", { autoClose: 3000 });
      }
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const validStatuses = ["Active", "Completed", "Cancelled"];
      
     if (!validStatuses.includes(planEditData.status)) {
        toast.error("Please select a valid status: Active, Completed, or Cancelled", { autoClose: 3000 });
        return;
      }
  
      const payload = {
        userEmail: planEditData.userEmail?.trim(),
        name: planEditData.name?.trim(),
        amount: planEditData.amount ? parseFloat(planEditData.amount) : undefined,
        dailyReturn: planEditData.dailyReturn ? parseFloat(planEditData.dailyReturn) : undefined,
        days: planEditData.days ? parseInt(planEditData.days, 10) : undefined,
        status: planEditData.status,
      };
  
     Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  
      const response = await axios.put(
        `http://localhost:5000/api/admin/plans/${editingPlan._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
  
      setPlans(plans.map((p) => (p._id === editingPlan._id ? response.data : p)));
      toast.success("Plan updated successfully!", { autoClose: 3000 });
      setEditingPlan(null);
      setPlanEditData({ userEmail: "", name: "", amount: "", dailyReturn: "", days: "", status: "" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update plan";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/admin/plans/${planId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlans(plans.filter((p) => p._id !== planId));
        toast.success("Plan deleted successfully!", { autoClose: 3000 });
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete plan");
        toast.error(error.response?.data?.message || "Failed to delete plan", { autoClose: 3000 });
      }
    }
  };

  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/admin/withdrawals/${withdrawalId}/approve`,
        { status: "approved" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      const withdrawalsResponse = await axios.get(
        "http://localhost:5000/api/admin/withdrawals",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      setWithdrawals(withdrawalsResponse.data);
      toast.success("Withdrawal approved successfully!", { autoClose: 3000 });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to approve withdrawal");
      toast.error(error.response?.data?.message || "Failed to approve withdrawal", { autoClose: 3000 });
    }
  };

  const handleRejectWithdrawal = async (withdrawalId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/admin/withdrawals/${withdrawalId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status === 200 || response.status === 201) {
        const withdrawalsResponse = await axios.get(
          "http://localhost:5000/api/admin/withdrawals",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setWithdrawals(withdrawalsResponse.data);
        toast.success("Withdrawal rejected successfully!", { autoClose: 3000 });
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      const errorDetails = {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message,
      };
      console.error("Reject withdrawal error:", errorDetails);
      const errorMessage = error.response?.data?.message || "Failed to reject withdrawal. Server error occurred.";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleViewDetails = async (type, id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/admin/${type}s/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedDetail(response.data);
      setDetailType(type);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch details");
      toast.error(error.response?.data?.message || "Failed to fetch details", { autoClose: 3000 });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Admin Login</h2>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 text-sm"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm disabled:bg-indigo-400"
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">Total Users</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">{stats.totalUsers}</dd>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">Active Plans</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">{stats.totalPlans}</dd>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">Daily Profit</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">₹{stats.dailyProfit}</dd>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">Total Profit</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">₹{stats.totalProfit}</dd>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex flex-wrap">
              <button
                onClick={() => setActiveTab("users")}
                className={`${
                  activeTab === "users"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("plans")}
                className={`${
                  activeTab === "plans"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                Plans
              </button>
              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`${
                  activeTab === "withdrawals"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`${
                  activeTab === "audit"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                Audit Logs
              </button>
            </nav>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Joined Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Plans
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Invested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Wallet Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-indigo-400"
                          onClick={() => handleViewDetails("user", user._id)}
                        >
                          <div className="text-sm font-medium text-white">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{user.isAdmin ? "Yes" : "No"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{user.plansCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">₹{user.totalInvested}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">₹{user.walletBalance}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setUserEditData({
                                name: user.name,
                                email: user.email,
                                password: "",
                                isAdmin: user.isAdmin,
                              });
                            }}
                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === "plans" && (
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Purchase Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Daily Return
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Days Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {plans.map((plan) => (
                      <tr key={plan._id}>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-indigo-400"
                          onClick={() => handleViewDetails("plan", plan._id)}
                        >
                          <div className="text-sm font-medium text-white">{plan.userName}</div>
                          <div className="text-sm text-gray-400">{plan.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{plan.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">{new Date(plan.purchaseDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">₹{plan.amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">₹{plan.dailyReturn}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{plan.daysRemaining}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              plan.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {plan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingPlan(plan);
                              setPlanEditData({
                                userEmail: plan.userEmail,
                                name: plan.name,
                                amount: plan.amount,
                                dailyReturn: plan.dailyReturn,
                                days: plan.days,
                                status: plan.status,
                              });
                            }}
                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal._id}>
                        <td
                          className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-indigo-400"
                          onClick={() => handleViewDetails("withdrawal", withdrawal._id)}
                        >
                          <div className="text-sm font-medium text-white">{withdrawal.userName}</div>
                          <div className="text-sm text-gray-400">{withdrawal.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">₹{withdrawal.amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {new Date(withdrawal.requestDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              withdrawal.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : withdrawal.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {withdrawal.status === "Pending" && (
                            <div>
                              <button
                                onClick={() => handleApproveWithdrawal(withdrawal._id)}
                                className="text-indigo-400 hover:text-indigo-300 mr-4"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(withdrawal._id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === "audit" && (
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{log.adminId?.name || "Unknown"}</div>
                          <div className="text-sm text-gray-400">{log.adminId?.email || "Unknown"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{log.action}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{log.details}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* User Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Edit User</h2>
              <form onSubmit={handleUpdateUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400">Name</label>
                  <input
                    type="text"
                    value={userEditData.name}
                    onChange={(e) => setUserEditData({ ...userEditData, name: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400">Email</label>
                  <input
                    type="email"
                    value={userEditData.email}
                    onChange={(e) => setUserEditData({ ...userEditData, email: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400">
                    Password (leave blank to keep unchanged)
                  </label>
                  <input
                    type="password"
                    value={userEditData.password}
                    onChange={(e) => setUserEditData({ ...userEditData, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400">Admin</label>
                  <input
                    type="checkbox"
                    checked={userEditData.isAdmin}
                    onChange={(e) => setUserEditData({ ...userEditData, isAdmin: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-400">Is Admin</span>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setUserEditData({ name: "", email: "", password: "", isAdmin: false });
                    }}
                    className="mr-2 bg-gray-600 text-gray-300 py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plan Edit Modal */}
        {editingPlan && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Edit Plan</h2>
      <form onSubmit={handleUpdatePlan}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400">User Email</label>
          <input
            type="email"
            value={planEditData.userEmail}
            onChange={(e) => setPlanEditData({ ...planEditData, userEmail: e.target.value })}
            required
            placeholder="Enter user email"
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400">Plan Name</label>
          <input
            type="text"
            value={planEditData.name}
            onChange={(e) => setPlanEditData({ ...planEditData, name: e.target.value })}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400">Amount (₹)</label>
          <input
            type="number"
            value={planEditData.amount}
            onChange={(e) => setPlanEditData({ ...planEditData, amount: e.target.value })}
            required
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400">Daily Return (₹)</label>
          <input
            type="number"
            value={planEditData.dailyReturn}
            onChange={(e) => setPlanEditData({ ...planEditData, dailyReturn: e.target.value })}
            required
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400">Days</label>
          <input
            type="number"
            value={planEditData.days}
            onChange={(e) => setPlanEditData({ ...planEditData, days: e.target.value })}
            required
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400">Status</label>
          <select
            value={planEditData.status || ""}
            onChange={(e) => setPlanEditData({ ...planEditData, status: e.target.value })}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-inner bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Select Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setEditingPlan(null);
              setPlanEditData({ userEmail: "", name: "", amount: "", dailyReturn: "", days: "", status: "" });
            }}
            className="mr-2 bg-gray-600 text-gray-300 py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* Details Modal */}
        {selectedDetail && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg sm:max-w-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">
                {detailType.charAt(0).toUpperCase() + detailType.slice(1)} Details
              </h2>
              {detailType === "user" && (
                <div>
                  <p className="mb-2">
                    <strong className="text-gray-400">Name:</strong>{" "}
                    <span className="text-white">{selectedDetail.name}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Email:</strong>{" "}
                    <span className="text-white">{selectedDetail.email}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Admin:</strong>{" "}
                    <span className="text-white">{selectedDetail.isAdmin ? "Yes" : "No"}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Joined:</strong>{" "}
                    <span className="text-white">{new Date(selectedDetail.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Plans:</strong>{" "}
                    <span className="text-white">{selectedDetail.plansCount}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Total Invested:</strong>{" "}
                    <span className="text-white">₹{selectedDetail.totalInvested}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Wallet Balance:</strong>{" "}
                    <span className="text-white">₹{selectedDetail.walletBalance}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Withdrawals:</strong>
                  </p>
                  <ul className="list-disc pl-5 text-white">
                    {selectedDetail.withdrawals.map((w) => (
                      <li key={w._id}>
                        ₹{w.amount} - {w.status} ({new Date(w.requestDate).toLocaleDateString()})
                        {w.rejectionReason && ` - Reason: ${w.rejectionReason}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detailType === "plan" && (
                <div>
                  <p className="mb-2">
                    <strong className="text-gray-400">User:</strong>{" "}
                    <span className="text-white">
                      {selectedDetail.userName} ({selectedDetail.userEmail})
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Plan:</strong>{" "}
                    <span className="text-white">{selectedDetail.name}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Amount:</strong>{" "}
                    <span className="text-white">₹{selectedDetail.amount}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Daily Return:</strong>{" "}
                    <span className="text-white">₹{selectedDetail.dailyReturn}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Days:</strong>{" "}
                    <span className="text-white">{selectedDetail.days}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Days Remaining:</strong>{" "}
                    <span className="text-white">{selectedDetail.daysRemaining}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Purchase Date:</strong>{" "}
                    <span className="text-white">{new Date(selectedDetail.purchaseDate).toLocaleDateString()}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Status:</strong>{" "}
                    <span className="text-white">{selectedDetail.status}</span>
                  </p>
                </div>
              )}
              {detailType === "withdrawal" && (
                <div>
                  <p className="mb-2">
                    <strong className="text-gray-400">User:</strong>{" "}
                    <span className="text-white">
                      {selectedDetail.userName} ({selectedDetail.userEmail})
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Amount:</strong>{" "}
                    <span className="text-white">₹{selectedDetail.amount}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Request Date:</strong>{" "}
                    <span className="text-white">{new Date(selectedDetail.requestDate).toLocaleDateString()}</span>
                  </p>
                  {selectedDetail.processedDate && (
                    <p className="mb-2">
                      <strong className="text-gray-400">Processed Date:</strong>{" "}
                      <span className="text-white">{new Date(selectedDetail.processedDate).toLocaleDateString()}</span>
                    </p>
                  )}
                  <p className="mb-2">
                    <strong className="text-gray-400">Status:</strong>{" "}
                    <span className="text-white">{selectedDetail.status}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-400">Payment Method:</strong>{" "}
                    <span className="text-white">{selectedDetail.paymentMethod}</span>
                  </p>
                  {selectedDetail.rejectionReason && (
                    <p className="mb-2">
                      <strong className="text-gray-400">Rejection Reason:</strong>{" "}
                      <span className="text-white">{selectedDetail.rejectionReason}</span>
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="bg-gray-600 text-gray-300 py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Admin;