const crypto = require("crypto");
const User = require("../models/User");
const { sendResetEmail } = require("../utils/nodemailerConfig");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    await sendResetEmail(user.email, resetUrl);

    res.status(200).json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error.code === "EAUTH") {
      return res.status(500).json({ message: "Email service authentication failed. Please try again later." });
    }
    res.status(500).json({ message: "Failed to send reset link. Please try again." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    
    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
};

exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    res.status(200).json({ message: "Token is valid." });
  } catch (error) {
    console.error("Validate token error:", error);
    res.status(500).json({ message: "Failed to validate reset token." });
  }
};