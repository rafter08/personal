const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Referral = require("../models/Referral");
const User = require("../models/User");
const Plan = require("../models/Plan");

router.get("/", auth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user.id }).populate("referred");
    
    const validReferrals = referrals.filter((r) => r.referred && r.referred._id);
    

    const referredUsers = await Promise.all(
      validReferrals.map(async (referral) => {
        const plans = await Plan.find({ user: referral.referred._id });
        return {
          _id: referral.referred._id,
          name: referral.referred.name || "Unknown",
          joinedDate: referral.referred.createdAt || new Date(),
          plansCount: plans.length,
          bonusEarned: referral.bonusPaid ? referral.bonusAmount : 0,
        };
      })
    );
 

    const user = await User.findById(req.user.id).select("referralCode");
    res.json({
      code: user.referralCode || "",
      referredUsers,
    });
  } catch (err) {
    console.error(`Error fetching referrals for user ${req.user.id}: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/milestones", auth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user.id, bonusPaid: true });
    const referredCount = referrals.length;

    const tier1 = {
      users: referredCount,
      targetUsers: 10,
      bonus: 750,
      achieved: referredCount >= 10,
    };

    const tier2 = {
      users: referredCount,
      targetUsers: 25,
      bonus: 1500,
      achieved: referredCount >= 25,
    };

    res.json({ tier1, tier2 });
  } catch (err) {
    console.error(`Error fetching milestones for user ${req.user.id}: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;