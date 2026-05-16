const express = require("express");
const Router = express.Router();
const { createbazar, createCheckoutSession } = require("../controllers/Bazaar/Bazaarcontrollers");
const { createBazaarValidation } = require("../middleware/BazaarValidation");
const upload = require("../middleware/uploadMiddleware");
const { stripeWebhook } = require("../controllers/stripe/webhookcontroller");



Router.post(
  "/create",
  upload.array("image", 1),
  createBazaarValidation(),
  createbazar
);
Router.post("/checkout", createCheckoutSession);
Router.post( "/webhook",express.raw({ type: "application/json" }), stripeWebhook);

module.exports=Router