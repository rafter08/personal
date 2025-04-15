const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Plan = require("../models/Plan");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Referral = require("../models/Referral");
const ReferralMilestone = require("../models/ReferralMilestone");

const planData = [
  { id: 1, price: 299, dailyReturn: 20, days: 30, name: "Starter" },
  { id: 2, price: 499, dailyReturn: 35, days: 30, name: "Basic" },
  { id: 3, price: 999, dailyReturn: 60, days: 30, name: "Standard" },
  { id: 4, price: 1999, dailyReturn: 120, days: 30, name: "Premium" },
  { id: 5, price: 3499, dailyReturn: 200, days: 30, name: "Gold" },
  { id: 6, price: 4999, dailyReturn: 300, days: 30, name: "Platinum" },
  { id: 7, price: 9999, dailyReturn: 500, days: 30, name: "Diamond" },
];

router.get("/", (req, res) => {
  res.json(planData);
});

router.get("/user", auth, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user.id }).sort({ purchaseDate: -1 });
    res.json(plans);
  } catch (err) {
    console.error(`Error fetching plans for user ${req.user.id}: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/purchase", auth, async (req, res) => {
  try {
    const { planId, amount, paymentMethod, paymentId } = req.body;
    const planInfo = planData.find((p) => p.id === Number.parseInt(planId));
    if (!planInfo) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const plan = new Plan({
      user: req.user.id,
      planId: planInfo.id,
      name: planInfo.name,
      amount: planInfo.price,
      dailyReturn: planInfo.dailyReturn,
      days: planInfo.days,
      daysRemaining: planInfo.days,
    });
    await plan.save();
    

    const user = await User.findById(req.user.id).select("referralCode referredBy");
    let referralCode = user.referralCode;

    if (!referralCode) {
      referralCode = await User.generateUniqueReferralCode();
      user.referralCode = referralCode;
      await user.save();
   
    }

   if (user.referredBy) {
      const referral = await Referral.findOne({ referred: user._id });
      if (referral && !referral.bonusPaid) {
        referral.bonusPaid = true;
        referral.firstPlan = plan._id;
        await referral.save();

        let referrerWallet = await Wallet.findOne({ user: user.referredBy });
        if (!referrerWallet) {
          referrerWallet = new Wallet({ user: user.referredBy });
        }
        referrerWallet.totalEarnings += referral.bonusAmount;
        referrerWallet.balance += referral.bonusAmount;
        referrerWallet.withdrawable += referral.bonusAmount;
        referrerWallet.transactions.push({
          type: "Referral",
          amount: referral.bonusAmount,
          status: "Completed",
        });
        await referrerWallet.save();
       

        const referrals = await Referral.find({ referrer: user.referredBy, bonusPaid: true });
        const referredCount = referrals.length;

        let milestoneDoc = await ReferralMilestone.findOne({ user: user.referredBy });
        if (!milestoneDoc) {
          milestoneDoc = new ReferralMilestone({ user: user.referredBy, milestonesAwarded: [] });
          await milestoneDoc.save();
        }

        let wallet = await Wallet.findOne({ user: user.referredBy });
        if (!wallet) {
          wallet = new Wallet({ user: user.referredBy });
          await wallet.save();
        }

        if (
          referredCount >= 10 &&
          !milestoneDoc.milestonesAwarded.some((m) => m.type === "Tier1")
        ) {
          const milestoneBonus = 750;
          wallet.totalEarnings += milestoneBonus;
          wallet.balance += milestoneBonus;
          wallet.withdrawable += milestoneBonus;
          wallet.transactions.push({
            type: "ReferralMilestone",
            amount: milestoneBonus,
            status: "Completed",
          });
          milestoneDoc.milestonesAwarded.push({ type: "Tier1" });
          await Promise.all([wallet.save(), milestoneDoc.save()]);
          
        }

        if (
          referredCount >= 25 &&
          !milestoneDoc.milestonesAwarded.some((m) => m.type === "Tier2")
        ) {
          const milestoneBonus = 1500;
          wallet.totalEarnings += milestoneBonus;
          wallet.balance += milestoneBonus;
          wallet.withdrawable += milestoneBonus;
          wallet.transactions.push({
            type: "ReferralMilestone",
            amount: milestoneBonus,
            status: "Completed",
          });
          milestoneDoc.milestonesAwarded.push({ type: "Tier2" });
          await Promise.all([wallet.save(), milestoneDoc.save()]);
          
        }
      }
    }

    res.json({ plan, referralCode });
  } catch (err) {
    console.error(`Error in plan purchase for user ${req.user.id}: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;