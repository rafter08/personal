const mongoose = require("mongoose");

const ReferralMilestoneSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  milestonesAwarded: [
    {
      type: {
        type: String,
        enum: ["Tier1", "Tier2"],
        required: true,
      },
      date: { type: Date, default: Date.now },
    },
  ],
});


module.exports = mongoose.model("ReferralMilestone", ReferralMilestoneSchema);