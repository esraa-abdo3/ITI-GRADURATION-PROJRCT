const { body } = require("express-validator")

const validationSchema = () => {
    return [
        body('Fullname')
            .notEmpty()
            .withMessage("Fullname is required")
            .isLength({min: 2})
            .withMessage("Fullname must be  at least is 2 digits"),
        body('password')
            .notEmpty()
            .isLength({min: 6})
            .withMessage("password must be at least 6 characters"),
        body('email')
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("please enter a valid email"),
    ]
}

module.exports = {
    validationSchema
}