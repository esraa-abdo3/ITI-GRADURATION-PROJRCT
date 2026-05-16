const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Bazaar = require("../../models/Bazaar.model");
const User = require("../../models/Usermodel");
const imagekit = require("../../utils/imagekit");
const AppError = require("../../utils/AppError");
const { Success, Fail } = require("../../utils/HttpsStatus");
const OTP = require("../../models/otpmodel");
const sendEmail = require("../../utils/sendEmail")
const stripe = require("../../utils/stripe");

const createbazar = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(AppError.createError({ data: errors.array() }, 400, Fail));
  }

  const {
    name,
    type,
    description,
    address,
    capacity,
    hybridPricing,
    startDate,
    endDate,
    email,
    phone,
    socialLinks,
    Fullname
  } = req.body;
const pricing = JSON.parse(req.body.pricing || "[]");
console.log(pricing);
  /* ---------------- USER LOGIC ---------------- */

  let user = await User.findOne({ email });

  if (user) {
    if (user.role === "customer") {
      user.role = "bazaarowner";
      await user.save();
    }
  } else {
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await User.create({
      Fullname,
      email,
      password: hashedPassword,
      role: "bazaarowner",
      phone: phone,
       temporaryPassword: randomPassword
    });
  }

  /* ---------------- IMAGE UPLOAD ---------------- */

let image;

if (!req.files || req.files.length === 0) {
  return next(AppError.createError("image is required", 400, Fail));
}

const file = req.files[0];

const upload = await imagekit.upload({
  file: file.buffer,
  fileName: Date.now() + "-" + file.originalname,
  folder: "/bazaars"
});

  image = upload.url;


  /* ---------------- CREATE BAZAAR ---------------- */

  const bazaar = await Bazaar.create({
    name,
    type,
    description,
    image,
    address,
    capacity,
    pricing,
    hybridPricing,
    startDate,
    endDate,
    email,
    phone,
    socialLinks,
    owner: user._id,
    status: "draft" 
  });
  
  /// generte otp
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // create otp
  await OTP.create({
  email,
  otp,
  expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
  //send message
  await sendEmail(email, otp);

  res.status(201).json({
    status: Success,
    msg: "Bazaar created successfully (pending verification)",
    data: bazaar
  });
};
const createCheckoutSession = async (req, res) => {
  const { bazaarId } = req.body;

  const session = await stripe.checkout.sessions.create({

    payment_method_types: ["card"],

    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "egp",

       product_data: {
       name: "Bazaar Creation",
       description: "Design service for your store"
         },

          unit_amount: 500000 // 5000 جنيه
        },

        quantity: 1
      }
      
    ],
      metadata: {
    bazaarId: bazaarId
  },
    

    success_url: "http://localhost:3000/payment-success",

    cancel_url: "http://localhost:3000/payment-cancel"
  });

  res.json({
    url: session.url
  });
};
module.exports = { createbazar ,createCheckoutSession };