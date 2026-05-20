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
const Asncwarpper = require("../../middleware/Asncwrapper")


const validatePricingByType = (type, pricing) => {
  if (type === "online") {
    return pricing.some((p) => p.type === "online");
  }

  if (type === "offline") {
    return pricing.some((p) => p.type === "offline");
  }

  if (type === "hybrid") {
    return (
      pricing.some((p) => p.type === "online") &&
      pricing.some((p) => p.type === "offline")
    );
  }

  return false;
};

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

  if (!validatePricingByType(type, pricing)) {
    return next(
      AppError.createError(
        `Pricing must match bazaar type (${type})`,
        400,
        "Fail"
      )
    );
  }
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
  await sendEmail(email, otp, " Thank you for signing up. To complete your verification, please use the OTP code below"
);

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
const getallbazarrs = Asncwarpper( async (req, res,) => {
   const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (limit * (page - 1)); 
  const bazzars = await Bazaar.find({}).sort(({ createdAt: -1 }).limit(limit).skip(skip));
    res.status(200).json({
    status: Success,
    msg: "Bazaar created successfully (pending verification)",
    data: bazaars
  });
})
const getbazarbyid =  Asncwarpper (async (req, res, next) => {

    const id = req.params.id;

    const bazar = await Bazaar.findById(id);

    if (!bazar) {
      return next(
        AppError.createError({ data: "bazar not found" }, 404)
      );
    }

    res.status(200).json({
      status: "success",
      msg: "Bazaar fetched successfully",
      data: bazar,
    });
  
});
const deletebazarbyid = Asncwarpper(async (req, res, next) => {
  
  const id = req.params.id;


  const bazar = await Bazaar.findById(id);

  if (!bazar) {
    return next(
      AppError.createError({ data: "bazar not found" }, 404)
    );
  }


  await User.findByIdAndUpdate(
    bazar.owner,
    {
      role: "customer",
    }
  );


  await Bazaar.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    msg: "Bazaar deleted successfully",
    data: null,
  });

});
/////////////////////////////////////////////////////////////



const updatebazarbyid = Asncwarpper(async (req, res, next) => {

  const id = req.params.id;
  const bazaar = await Bazaar.findById(id);

  if (!bazaar) {
  return next(AppError.createError("Bazaar not found", 404, "Fail"));
  }

  
  if (bazaar.owner.toString() !== req.user.id.toString() && req.user.role !== "admin") {
    return next(AppError.createError(  "You cannot update this bazaar",  403,  "Fail"));
  }


  const allowedFields = [
    "Fullname",
    "phone",
    "name",
    "type",
    "address",
    "description",
    "startDate",
    "endDate",
    "pricing",
    "socialLinks",
    "hybridPricing"
  ];

  const updateData = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

 
  if ("email"in req.body) {
    return next(
      AppError.createError(
        "Email cannot be updated",
        400,
        "Fail"
      )
    );
  }

  if (req.files?.image) {
    updateData.image = req.files.image[0].path;
  }
 // vsldaition on price and type
if (req.body.pricing || req.body.type) {
  const newPricing = req.body.pricing || bazaar.pricing;
  const newType = req.body.type || bazaar.type;

  if (!validatePricingByType(newType, newPricing)) {
    return next(
      AppError.createError(
        `Pricing must match bazaar type (${newType})`,
        400,
        "Fail"
      )
    );
  }
}





  const updatedBazaar = await Bazaar.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: "Success",
    message: "Bazaar updated successfully",
    data: updatedBazaar
  });
});



const autoCloseBazaar = Asncwarpper(async (req, res, next) => {
  const id = req.params.id;
  const bazaar = await Bazaar.findById(id);

  if (!bazaar) {
    return next(AppError.createError("Bazaar not found", 404, "Fail"));
  }

  if (
    bazaar.owner.toString() !== req.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(AppError.createError("You cannot update this bazaar", 403, "Fail"));
  }

  const { automationRules } = req.body;


  if (automationRules !== undefined) {
    bazaar.automationRules = { ...bazaar.automationRules.toObject(),...automationRules};
  }


  if (bazaar.automationRules.enabled) {
    if (
      bazaar.automationRules.closeWhenFull &&
      bazaar.bookedSlots >= bazaar.capacity
    ) {
      bazaar.status = "closed";
    }

    if (bazaar.automationRules.closeBeforeStart) {
      const now = new Date();
      const closeDate = new Date(bazaar.startDate);
      closeDate.setHours(
        closeDate.getHours() - bazaar.automationRules.closeBeforeHours
      );

      if (now >= closeDate) {
        bazaar.status = "closed";
      }
    }
  }

  const updatedBazaar = await bazaar.save();

  res.status(200).json({
    status: "Success",
    message: "Bazaar registration management updated successfully",
    data: updatedBazaar,
  });
});
const toggleBazaarStatus = Asncwarpper( async (req, res) => {
  try {
    const { id } = req.params;

    const bazaar = await Bazaar.findById(id);

    if (!bazaar) {
      return res.status(404).json({ message: "Bazaar not found" });
    }
      if (
    bazaar.owner.toString() !== req.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(AppError.createError("You cannot update this bazaar", 403, "Fail"));
  }


    if (bazaar.status === "open") {
      bazaar.status = "closed";
    } else {
      bazaar.status = "open";
    }

    await bazaar.save();

    return res.status(200).json({
      message: "Status updated successfully",
      status: bazaar.status,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
const updateBazaarCapacity = Asncwarpper (async (req, res) => {
  try {
    const { id } = req.params;
    const { capacity } = req.body;

    const bazaar = await Bazaar.findById(id);

    if (!bazaar) {
      return res.status(404).json({ message: "Bazaar not found" });
    }
          if (
    bazaar.owner.toString() !== req.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(AppError.createError("You cannot update this bazaar", 403, "Fail"));
  }


    if (capacity < bazaar.bookedSlots) {
      return res.status(400).json({
        message: "Capacity cannot be less than booked slots",
      });
    }

    bazaar.capacity = capacity;

    await bazaar.save();

    return res.status(200).json({
      message: "Capacity updated successfully",
      capacity: bazaar.capacity,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createbazar,
  createCheckoutSession,
  getallbazarrs,
  getbazarbyid,
  deletebazarbyid,
  updatebazarbyid,
  updateBazaarCapacity,
  autoCloseBazaar,
   toggleBazaarStatus
};