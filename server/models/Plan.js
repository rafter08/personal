const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  planId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  dailyReturn: {
    type: Number,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  daysRemaining: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  lastEarningDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["Active", "Completed", "Cancelled"],
    default: "Active",
  },
});



module.exports = mongoose.model("Plan", PlanSchema);