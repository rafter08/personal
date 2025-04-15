const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    if (!this.password) {
      throw new Error("Password is required");
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error("No password set for user");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.statics.generateUniqueReferralCode = async function () {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existingUser = await this.findOne({ referralCode: code });
    if (!existingUser) {
      return code;
    }
  }
  throw new Error("Unable to generate unique referral code after 10 attempts");
};

module.exports = mongoose.model("User", UserSchema);