const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Date,
  verified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("OTP", otpSchema);