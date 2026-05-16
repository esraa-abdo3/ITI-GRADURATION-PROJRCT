const mongoose = require("mongoose");
const mongoconnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log(" MongoDB connected")
        
    }
    catch (err) {
        console.log(" MongoDB connection error:", err)
        
    }

}
module.exports=mongoconnect
