const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
  bonusPaid: { type: Boolean, default: false },
  bonusAmount: { type: Number, default: 200 },
  firstPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
});


module.exports = mongoose.model("Referral", ReferralSchema);