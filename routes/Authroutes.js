const express = require("express");
const Router = express.Router();
const { register, login ,forgetpassword,resetpassword } =require("../controllers/Auth/Authcontrollers")
const { body } = require("express-validator");
const { validationSchema } = require("../middleware/validationSchema");
const { verifyOtp } = require("../controllers/vervify/verifyemail");
Router.post("/register", validationSchema(), register);
Router.post("/login", [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
], login);


Router.post('/Emailverification', [
        body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("otp").notEmpty().withMessage("password is required").isLength( 6 ).withMessage("otp must be  6 characters long")

], verifyOtp)
Router.post("/forgetpassword", [
       body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")
], forgetpassword)
Router.post("/ressetpassword", [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
     body("password").notEmpty().withMessage("password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
],resetpassword)
module.exports = Router;