const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  resetPassword,
  validateResetToken,
} = require("../controllers/forgotPasswordController");
const { check } = require("express-validator");

router.post(
  "/forgot-password",
  [check("email", "Please include a valid email").isEmail()],
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [check("password", "Password must be at least 6 characters").isLength({ min: 6 })],
  resetPassword
);

router.get("/validate-reset-token/:token", validateResetToken);

module.exports = router;