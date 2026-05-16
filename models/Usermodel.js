const monogoose = require('mongoose');
const UserRoles=require("../utils/UserRoles")
const userSchema = new monogoose.Schema({
    Fullname: {
        type: String,
        required: [true, "name is required"],
        minLength: [2, "name must be at least 2 characters"],
        maxLength: [20, "name must be less than 20 characters"],
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "please enter a valid email"],
   },
   password: {
    type: String,
    required: [true, "password is required"],
   },

   role: {
      type: String,
      enum: [UserRoles.ADMIN, UserRoles.BAZAAROWNER, UserRoles.BRANDOWNER, UserRoles.CUSTOMER],
      default: "customer"
    },
   phone: {
       type:String,
    },
   temporaryPassword: {
  type: String,
  default: null
}
}, { timestamps: true });
const userModel = monogoose.model("User", userSchema);
module.exports = userModel;