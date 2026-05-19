const express = require("express");
const Router = express.Router();
const { createbazar, createCheckoutSession,getallbazarrs, getbazarbyid, deletebazarbyid, updatebazarbyid, updateBazaarCapacity ,toggleBazaarStatus,autoCloseBazaar} = require("../controllers/Bazaar/Bazaarcontrollers");
const { createBazaarValidation } = require("../middleware/BazaarValidation");
const upload = require("../middleware/uploadMiddleware");
const { stripeWebhook } = require("../controllers/stripe/webhookcontroller");
const verfiyToken = require("../middleware/VerfiyToken");
const AllowedTo = require("../../../Node/blog-app/middleware/AllowedTo");


Router.post(
  "/create",
  upload.array("image", 1),
  createBazaarValidation(),
  createbazar
);
Router.get("/GetAllbazaars", verfiyToken, AllowedTo("admin"), getallbazarrs)
Router.get("/GetAllbazaars/:id", verfiyToken, AllowedTo("admin"), getbazarbyid)
Router.get("/delete/:id", verfiyToken, AllowedTo("admin"), deletebazarbyid)
Router.patch("/Update/:id", verfiyToken, AllowedTo("admin", "bazaarowner", updatebazarbyid))
Router.patch("/Capacity/:id", verfiyToken, AllowedTo("admin", "bazaarowner", updateBazaarCapacity))
Router.patch("/Status", verfiyToken, AllowedTo("admin", "bazaarowner"), toggleBazaarStatus)
Router.patch("/autoClose", verfiyToken,AllowedTo("admin", "bazaarowner"),autoCloseBazaar)

module.exports=Router