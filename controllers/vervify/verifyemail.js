const OTP =require("../../models/otpmodel")
const verifyOtp = async (req, res, next) => {

  const { email, otp } = req.body;

  const existingOtp = await OTP.findOne({
    email,
    otp,
    verified: false
  });

  if (!existingOtp) {
    return res.status(400).json({
      msg: "Invalid OTP"
    });
  }

  if (existingOtp.expiresAt < Date.now()) {
    return res.status(400).json({
      msg: "OTP expired",
      status:404
    });
  }

  existingOtp.verified = true;

  await existingOtp.save();

  res.json({
    msg: "OTP verified successfully"
  });
};
module.exports = {
  verifyOtp
  
}