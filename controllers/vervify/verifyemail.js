
// const verifyOtp = async (req, res, next) => {

//   const { email, otp } = req.body;

//   const existingOtp = await OTP.findOne({
//     email,
//     otp,
//     verified: false
//   });

//   if (!existingOtp) {
//     return res.status(400).json({
//       msg: "Invalid OTP"
//     });
//   }

//   if (existingOtp.expiresAt < Date.now()) {
//     return res.status(400).json({
//       msg: "OTP expired",
//       status:404
//     });
//   }

//   existingOtp.verified = true;

//   await existingOtp.save();

//   res.json({
//     msg: "OTP verified successfully"
//   });
// };
// module.exports = {
//   verifyOtp
  
// }
const OTP = require("../../models/otpmodel")
const bcrypt = require('bcryptjs');
const { Success, Error, Fail } = require("../../utils/HttpsStatus");
const AppError = require("../../utils/AppError");
const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord) {
    return next(
      AppError.createError("OTP not found", 400, Fail)
    );
  }

  // check expiry
  if (otpRecord.expiresAt < Date.now()) {
    return next(
      AppError.createError("OTP expired", 400, Fail)
    );
  }

  // compare hashed otp
  const isMatch = await bcrypt.compare(otp, otpRecord.otp);

  if (!isMatch) {
    return next(
      AppError.createError("Invalid OTP", 400, Fail)
    );
  }
  otpRecord.verified = true;

await otpRecord.save();

  res.status(200).json({
    status: Success,
    msg: "OTP verified successfully",
  });
};
module.exports = {
  verifyOtp
  
}