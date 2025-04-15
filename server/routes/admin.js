const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");
const Plan = require("../models/Plan");
const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/Withdrawal");
const Referral = require("../models/Referral");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

router.get("/check", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.get("/stats", [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlans = await Plan.countDocuments({ status: "Active" });
    const dailyProfitResult = await Plan.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: null, total: { $sum: "$dailyReturn" } } },
    ]);
    const dailyProfit = dailyProfitResult[0]?.total || 0;
    const totalProfitResult = await Withdrawal.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalProfit = totalProfitResult[0]?.total || 0;

    res.json({
      totalUsers,
      totalPlans,
      dailyProfit,
      totalProfit,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.get("/users", [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const plansCount = await Plan.countDocuments({ user: user._id });
        const plans = await Plan.find({ user: user._id });
        const totalInvested = plans.reduce((sum, plan) => sum + plan.amount, 0);
        const wallet = await Wallet.findOne({ user: user._id });
        const walletBalance = wallet ? wallet.balance : 0;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          plansCount,
          totalInvested,
          walletBalance,
        };
      })
    );

    res.json(usersWithDetails);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/users", [auth, admin], async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
    });
    await user.save();

    const wallet = new Wallet({
      user: user._id,
      totalEarnings: 0,
      balance: 0,
      withdrawable: 0,
    });
    await wallet.save();

    await new AuditLog({
      adminId: req.user.id,
      action: "User Created",
      details: `Created user ${email}`,
    }).save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      plansCount: 0,
      totalInvested: 0,
      walletBalance: 0,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.put("/users/:id", [auth, admin], async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (typeof isAdmin === "boolean" && user.isAdmin !== isAdmin) {
      user.isAdmin = isAdmin;
      await new AuditLog({
        adminId: req.user.id,
        action: "User Admin Toggled",
        details: `Toggled isAdmin to ${isAdmin} for user ${user.email}`,
      }).save();
    }
    await user.save();

    const plansCount = await Plan.countDocuments({ user: user._id });
    const plans = await Plan.find({ user: user._id });
    const totalInvested = plans.reduce((sum, plan) => sum + plan.amount, 0);
    const wallet = await Wallet.findOne({ user: user._id });
    const walletBalance = wallet ? wallet.balance : 0;

    await new AuditLog({
      adminId: req.user.id,
      action: "User Updated",
      details: `Updated user ${user.email}`,
    }).save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      plansCount,
      totalInvested,
      walletBalance,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.delete("/users/:id", [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Wallet.findOneAndDelete({ user: req.params.id }),
      Plan.deleteMany({ user: req.params.id }),
      Withdrawal.deleteMany({ user: req.params.id }),
      Referral.deleteMany({
        $or: [{ referrer: req.params.id }, { referred: req.params.id }],
      }),
    ]);

    await new AuditLog({
      adminId: req.user.id,
      action: "User Deleted",
      details: `Deleted user ${user.email}`,
    }).save();

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.get("/plans", [auth, admin], async (req, res) => {
  try {
    const plans = await Plan.find().sort({ purchaseDate: -1 });

    const plansWithUserNames = await Promise.all(
      plans.map(async (plan) => {
        const user = await User.findById(plan.user);
        return {
          _id: plan._id,
          userName: user ? user.name : "Unknown",
          userEmail: user ? user.email : "Unknown",
          name: plan.name,
          amount: plan.amount,
          dailyReturn: plan.dailyReturn,
          days: plan.days,
          daysRemaining: plan.daysRemaining,
          purchaseDate: plan.purchaseDate,
          status: plan.status,
        };
      })
    );

    res.json(plansWithUserNames);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/plans", [auth, admin], async (req, res) => {
  try {
    const { userEmail, name, amount, dailyReturn, days } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = new Plan({
      user: user._id,
      name,
      amount,
      dailyReturn,
      days,
      daysRemaining: days,
      purchaseDate: new Date(),
      status: "Active",
    });
    await plan.save();

    await new AuditLog({
      adminId: req.user.id,
      action: "Plan Created",
      details: `Created plan ${name} for user ${userEmail}`,
    }).save();

    res.json({
      _id: plan._id,
      userName: user.name,
      userEmail: user.email,
      name: plan.name,
      amount: plan.amount,
      dailyReturn: plan.dailyReturn,
      days: plan.days,
      daysRemaining: plan.daysRemaining,
      purchaseDate: plan.purchaseDate,
      status: plan.status,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.put("/plans/:id", [auth, admin], async (req, res) => {
  try {
    const { userEmail, name, amount, dailyReturn, days, status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      plan.user = user._id;
    }

    if (name) plan.name = name;
    if (amount !== undefined) {
      if (isNaN(amount) || amount < 0) {
        return res
          .status(400)
          .json({ message: "Amount must be a valid number" });
      }
      plan.amount = parseFloat(amount);
    }
    if (dailyReturn !== undefined) {
      if (isNaN(dailyReturn) || dailyReturn < 0) {
        return res
          .status(400)
          .json({ message: "Daily return must be a valid number" });
      }
      plan.dailyReturn = parseFloat(dailyReturn);
    }
    if (days !== undefined) {
      if (!Number.isInteger(days) || days < 0) {
        return res
          .status(400)
          .json({ message: "Days must be a non-negative integer" });
      }
      plan.days = days;
      plan.daysRemaining = days;
    }
    if (status) {
      const validStatuses = ["Active", "Completed", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      plan.status = status;
    }

    await plan.save();

    const user = await User.findById(plan.user);
    if (!user) {
      return res.status(404).json({ message: "Associated user not found" });
    }

    await new AuditLog({
      adminId: req.user.id,
      action: "Plan Updated",
      details: `Updated plan ${plan.name} for user ${user.email}`,
    }).save();

    res.json({
      _id: plan._id,
      userName: user.name,
      userEmail: user.email,
      name: plan.name,
      amount: plan.amount,
      dailyReturn: plan.dailyReturn,
      days: plan.days,
      daysRemaining: plan.daysRemaining,
      purchaseDate: plan.purchaseDate,
      status: plan.status,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

router.delete("/plans/:id", [auth, admin], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const user = await User.findById(plan.user);
    const userEmail = user ? user.email : "Unknown";

    await Plan.findByIdAndDelete(req.params.id);

    try {
      await new AuditLog({
        adminId: req.user._id,
        action: "Plan Deleted",
        details: `Deleted plan "${plan.name}" for user ${userEmail}`,
      }).save();
    } catch (auditErr) {
      console.error("Audit log creation failed:", auditErr);
    }

    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("Error deleting plan:", {
      message: err.message,
      stack: err.stack,
      planId: req.params.id,
    });
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

router.get("/withdrawals", [auth, admin], async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ requestDate: -1 });

    const withdrawalsWithUserInfo = await Promise.all(
      withdrawals.map(async (withdrawal) => {
        const user = await User.findById(withdrawal.user);
        return {
          _id: withdrawal._id,
          userName: user ? user.name : "Unknown",
          userEmail: user ? user.email : "Unknown",
          amount: withdrawal.amount,
          requestDate: withdrawal.requestDate,
          processedDate: withdrawal.processedDate,
          status: withdrawal.status,
          paymentMethod: withdrawal.paymentMethod,
        };
      })
    );

    res.json(withdrawalsWithUserInfo);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/withdrawals/:id/approve", [auth, admin], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid withdrawal ID" });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }
    if (withdrawal.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Withdrawal request already processed" });
    }

    withdrawal.status = "Completed";
    withdrawal.processedDate = new Date();
    await withdrawal.save();

    const wallet = await Wallet.findOne({ user: withdrawal.user });
    if (wallet) {
      const transactionIndex = wallet.transactions.findIndex(
        (t) =>
          t.withdrawalId &&
          t.withdrawalId.toString() === withdrawal._id.toString()
      );
      if (transactionIndex !== -1) {
        wallet.transactions[transactionIndex].status = "Completed";
      }
      wallet.balance -= withdrawal.amount;
      await wallet.save();
    }

    await new AuditLog({
      adminId: req.user.id,
      action: "Withdrawal Approved",
      details: `Approved withdrawal of ₹${withdrawal.amount} for user ${withdrawal.user}`,
    }).save();

    res.json({ message: "Withdrawal request approved successfully" });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

router.post("/withdrawals/:id/reject", [auth, admin], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid withdrawal ID" });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }
    if (withdrawal.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Withdrawal request already processed" });
    }

    withdrawal.status = "Rejected";
    withdrawal.processedDate = new Date();
    await withdrawal.save();

    const wallet = await Wallet.findOne({ user: withdrawal.user });
    if (wallet) {
      wallet.transactions = wallet.transactions.map((t) => {
        if (
          t.withdrawalId &&
          t.withdrawalId.toString() === withdrawal._id.toString()
        ) {
          t.status = "Rejected";
        }
        return t;
      });
      wallet.withdrawable += withdrawal.amount;
      await wallet.save();
    }

    await new AuditLog({
      adminId: req.user.id,
      action: "Withdrawal Rejected",
      details: `Rejected withdrawal of ₹${withdrawal.amount} for user ${withdrawal.user}`,
    }).save();

    res.json({ message: "Withdrawal request rejected successfully" });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

router.get("/users/:id", [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plansCount = await Plan.countDocuments({ user: user._id });
    const plans = await Plan.find({ user: user._id });
    const totalInvested = plans.reduce((sum, plan) => sum + plan.amount, 0);
    const wallet = await Wallet.findOne({ user: user._id });
    const walletBalance = wallet ? wallet.balance : 0;
    const withdrawals = await Withdrawal.find({ user: user._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      plansCount,
      totalInvested,
      walletBalance,
      withdrawals,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.get("/plans/:id", [auth, admin], async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    const user = await User.findById(plan.user);

    res.json({
      _id: plan._id,
      userName: user ? user.name : "Unknown",
      userEmail: user ? user.email : "Unknown",
      name: plan.name,
      amount: plan.amount,
      dailyReturn: plan.dailyReturn,
      days: plan.days,
      daysRemaining: plan.daysRemaining,
      purchaseDate: plan.purchaseDate,
      status: plan.status,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.get("/withdrawals/:id", [auth, admin], async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    const user = await User.findById(withdrawal.user);

    res.json({
      _id: withdrawal._id,
      userName: user ? user.name : "Unknown",
      userEmail: user ? user.email : "Unknown",
      amount: withdrawal.amount,
      requestDate: withdrawal.requestDate,
      processedDate: withdrawal.processedDate,
      status: withdrawal.status,
      paymentMethod: withdrawal.paymentMethod,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.get("/audit-logs", [auth, admin], async (req, res) => {
  try {
    const logs = await AuditLog.find({
      action: {
        $in: [
          "User Created",
          "User Updated",
          "User Deleted",
          "User Admin Toggled",
          "Plan Created",
          "Plan Updated",
          "Plan Deleted",
          "Withdrawal Approved",
          "Withdrawal Rejected",
        ],
      },
    })
      .sort({ timestamp: -1 })
      .limit(100)
      .populate("adminId", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
