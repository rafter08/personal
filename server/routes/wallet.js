const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/Withdrawal");

// @route   GET api/wallet
// @desc    Get user's wallet
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = new Wallet({ user: req.user.id });
      await wallet.save();
    }

    let totalEarnings = 0;
    let balance = 0;
    let withdrawable = 0;

    wallet.transactions.forEach((t) => {
      if (t.status === "Completed") {
        if (t.type === "Earning" || t.type === "Referral" || t.type === "ReferralMilestone") {
          totalEarnings += t.amount;
          balance += t.amount;
          withdrawable += t.amount;
        } else if (t.type === "Withdrawal") {
          balance -= t.amount;
          withdrawable -= t.amount;
        } else if (t.type === "Refund") {
          balance += t.amount;
          withdrawable += t.amount;
        }
      }
    });

    withdrawable = wallet.withdrawable;
    const pendingWithdrawals = wallet.transactions
      .filter((t) => t.type === "Withdrawal" && t.status === "Pending")
      .reduce((sum, t) => sum + t.amount, 0);
    withdrawable -= pendingWithdrawals;

    withdrawable = Math.max(withdrawable, 0);

    wallet.totalEarnings = totalEarnings;
    wallet.balance = balance;
    wallet.withdrawable = withdrawable;
    await wallet.save();

    res.json({
      totalEarnings: wallet.totalEarnings,
      balance: wallet.balance,
      withdrawable: wallet.withdrawable,
      transactions: wallet.transactions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/wallet/withdraw
// @desc    Request a withdrawal
// @access  Private
router.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(400).json({ message: "Wallet not found" });
    }

    if (wallet.withdrawable < amount) {
      return res.status(400).json({ message: "Insufficient withdrawable balance" });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    const withdrawal = new Withdrawal({
      user: req.user.id,
      amount: parseFloat(amount),
      status: "Pending",
    });
    await withdrawal.save();

    wallet.withdrawable -= parseFloat(amount);
    wallet.transactions.push({
      type: "Withdrawal",
      amount: parseFloat(amount),
      status: "Pending",
      withdrawalId: withdrawal._id,
    });

    await wallet.save();

    res.json({ message: "Withdrawal request submitted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;