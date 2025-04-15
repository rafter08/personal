const mongoose = require("mongoose");

const WithdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  processedDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Rejected"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    default: "UPI",
  },
  paymentDetails: {
    type: String,
  },
});

module.exports = mongoose.model("Withdrawal", WithdrawalSchema);
