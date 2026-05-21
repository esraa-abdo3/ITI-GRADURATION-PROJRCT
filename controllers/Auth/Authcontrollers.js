const { validationResult } = require("express-validator");
const Asncwrapper = require("../../middleware/Asncwrapper");
const bcrypt = require('bcryptjs');
const Generatejwt = require("../../utils/Generatejwt");
const User =require("../../models/Usermodel")
const { Success, Error, Fail } = require("../../utils/HttpsStatus");
const AppError = require("../../utils/AppError");
const OTP = require("../../models/otpmodel");
const sendEmail = require("../../utils/sendEmail")




const register = (async (req, res, next) => {
    const errors = validationResult(req);
       if (!errors.isEmpty()) {
           const Error = AppError.createError({ data: errors.array() }, 400, Fail);
            return next(Error);
    }
    const { Fullname, email, password , role} = req.body
  const existuser = await User.findOne({ email });
    if (existuser) {
        const Error = AppError.createError({ data:"email already exist"}, 400, Fail);
       return next(Error);  
    }
    // hasn password
    const hashedpassword = await bcrypt.hash(password, 10);
    const newuser = await User.create({ Fullname, email, password: hashedpassword, role });
        // generate token
    const token = Generatejwt({ id: newuser._id, role: newuser.role, email: newuser.email });
    await newuser.save();
    res.cookie("token", token, {
  httpOnly: true,
  secure: false,        // لازم HTTPS في production
  sameSite: "lax",     // أو "none" لو cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
      res.status(201).json({ status: Success, msg: "user created successfully", data: { newuser } });
    
})
const login = (async (req, res, next) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           const Error = AppError.createError({ data: errors.array() }, 400, Fail);
            return next(Error);
    }
    const { email, password } = req.body
        const existuser = await User.findOne({ email });
        if (! existuser) {
            const Error = AppError.createError("Invalid email or password", 400, Fail);
            return next(Error);   
    }
       const isPasswordValid = await bcrypt.compare(password, existuser.password);
        if (!isPasswordValid) {
            const Error = AppError.createError({ data: "Invalid email or password" }, 400, Fail);
            return next(Error);
        }
    const token = Generatejwt({ id: existuser._id, role: existuser.role, email: existuser.email });
        res.cookie("token", token, {
  httpOnly: true,
  secure: false,        
  sameSite: "lax",     
  maxAge: 7 * 24 * 60 * 60 * 1000, 
});
        res.status(200).json({ status: "Success", data: { existuser  }, msg: "Login successful" })

})
 const forgetpassword = async (req, res, next) => {
  const { email } = req.body;

   const user = await User.findOne({ email });

  if (!user) {
    return next(
      AppError.createError("email not found", 400, Fail)
     )   }

//   // delete old OTPs
   await OTP.deleteMany({ email });

//   // generate OTP
   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   // save OTP (best practice: hash it)
   const hashedOtp = await bcrypt.hash(otp, 10);

   await OTP.create({
    email,     otp: hashedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
   });
   

//   // send email
   await sendEmail(
    email,
     otp,
     `We received a request to reset your password. Use this OTP: `
  );

   res.status(200).json({
     status: Success,
    msg: "OTP sent successfully",
   });
 };
const resetpassword = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    const Error = AppError.createError(
      "email not found",
      400,
      Fail
    );

    return next(Error);
  }
    const otpRecord = await OTP.findOne({ email });

  if (!otpRecord || !otpRecord.verified) {
    return next(
      AppError.createError(
        "OTP not verified",
        400,
        Fail
      )
    );
  }

  const hashedpassword = await bcrypt.hash(password, 10);

  user.password = hashedpassword;

  await user.save();

  res.status(201).json({
    status: Success,
    msg: "password reset successfully",
  });
};

module.exports = {
    register,
    login,
    forgetpassword,
    // forgetpassword,
    resetpassword 
}