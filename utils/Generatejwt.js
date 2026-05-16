const jwt = require("jsonwebtoken");
module.exports = (playload) => {
    const token = jwt.sign(playload, process.env.JWT_SECRET, { expiresIn: "1d" });
    return token;
    
}