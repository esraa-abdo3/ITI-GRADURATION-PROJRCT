const express = require("express");
const serverless = require("serverless-http"); 
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const mongoconnect = require("./config/dbconnect.js");
const app = express();
// midleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// connect to data base
mongoconnect()
// 404



// Routes
const authRoutes = require("./routes/Authroutes.js");
app.use("/api/v1/auth", authRoutes);

// create bazar
const BazaarRoutes = require("./routes/Bazaarroutes.js");
app.use("/api/v1/Bazaar", BazaarRoutes)

// pay for bazar
const paymentRoutes = require("./routes/paymentroutes.js");

app.use("/api/v1/payment", paymentRoutes);





app.use((req, res) => {
  res.status(404).json({ status: "Error", msg: "Route not found" });
}); 

// Global error handler
app.use((err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .json({ status: err.statusText || "Error", msg: err.msg || err.message, code: err.statusCode, data: null });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = app;