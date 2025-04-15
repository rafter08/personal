const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const Referral = require("../models/Referral");

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, referralCode } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
       return res.status(400).json({ message: "User already exists" });
      }

      user = new User({
        name,
        email,
        password,
      });

     
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          user.referredBy = referrer._id;
          const newReferral = new Referral({
            referrer: referrer._id,
            referred: user._id,
          });
          await newReferral.save();
       } else {
         return res.status(400).json({ message: "Invalid referral code" });
        }
      }

      await user.save();

      const payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: payload.user });
        }
      );
    } catch (err) {
      console.error(`Error registering user ${email}: ${err.message}`);
      res.status(500).send("Server error");
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
     

      if (!user.password) {
        console.error(`User ${email} has no password field`);
        return res.status(500).json({ message: "User account error" });
      }

      let isMatch;
      if (typeof user.comparePassword === "function") {
        isMatch = await user.comparePassword(password);
      } else {
        isMatch = await bcrypt.compare(password, user.password);
      }

      if (!isMatch) {
       return res.status(400).json({ message: "Invalid credentials" });
      }
      

      const payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
      };

      const secret = process.env.JWT_SECRET || "secret";
      jwt.sign(
        payload,
        secret,
        { expiresIn: "7d" },
        (err, token) => {
          if (err) {
           
            throw err;
          }
         res.json({ token, user: payload.user });
        }
      );
    } catch (err) {
      console.error(`Error logging in user ${email}: ${err.stack}`);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access Denied: You are not an admin." });
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, isAdmin: true });
      }
    );
  } catch (err) {
    console.error(`Error in admin login for ${email}: ${err.message}`);
    res.status(500).send("Server error");
  }
});

module.exports = router;