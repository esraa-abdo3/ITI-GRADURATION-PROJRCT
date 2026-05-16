const express = require("express");
const Router = express.Router();
const { stripeWebhook } = require("../controllers/stripe/webhookcontroller");
const { createCheckoutSession } = require("../controllers/Bazaar/Bazaarcontrollers");
Router.post("/checkout", createCheckoutSession);
Router.post( "/webhook", stripeWebhook);

module.exports=Router