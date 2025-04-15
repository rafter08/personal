const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Earning", "Withdrawal", "Refund", "Referral", "ReferralMilestone"],
    required: true,
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Rejected"],
    default: "Completed",
  },
  withdrawalId: { type: mongoose.Schema.Types.ObjectId, ref: "Withdrawal" },
});

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  totalEarnings: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  withdrawable: { type: Number, default: 0 },
  transactions: [TransactionSchema],
});

WalletSchema.index({ user: 1 });

module.exports = mongoose.model("Wallet", WalletSchema);
