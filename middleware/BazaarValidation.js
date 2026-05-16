const { body } = require("express-validator");

const createBazaarValidation = () => {
  return [
    body("name")
          .notEmpty().withMessage("name is required"),
      
///////////////////////////////////////////////////////////////
    body("type")
      .notEmpty().withMessage("type is required")
      .isIn(["online", "offline", "hybrid"])
      .withMessage("invalid type"),
/////////////////////////////////////////////////////////////////////////////
    body("description")
          .notEmpty().withMessage("description is required"),
//////////////////////////////////////////////////////////////////////////////////

body("address.fullAddress")
  .if((value, { req }) => req.body.type !== "online")
  .notEmpty()
  .withMessage("fullAddress is required for offline or hybrid bazaar"),
/////////////////////////////////////////////////////////////////////////////////////////////
    body("startDate")
          .notEmpty().withMessage("startDate is required"),
    
//////////////////////////////////////////////////////////////////////////////////////////////
    body("endDate")
          .notEmpty().withMessage("endDate is required"),
    ///////////////////////////////////////////////////////////////////////////

  body("pricing").custom((value) => {
  const data = typeof value === "string" ? JSON.parse(value) : value;

  if (!Array.isArray(data)) {
    throw new Error("pricing must be array");
  }

  return true;
}),
    ///////////////////////////////////////////////////////////////////////////////////
        body("email")
          .notEmpty().withMessage("email is required").isEmail()
          .withMessage("please enter a valid email"),
        //////////////////////////////////////////////////////////////////////////
           body("phone")
          .notEmpty().withMessage("phone is required") .isLength({ min: 12, max: 15 })
          .withMessage("phone number must be 12 digit"),
    ////////////////////////////////////////////////////////////////////////
               body("Fullname")
          .notEmpty().withMessage("Fullname is required"),
        
  ];
};

module.exports = { createBazaarValidation}