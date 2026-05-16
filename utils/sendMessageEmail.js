const nodemailer = require("nodemailer");
const sendMessageEmail = async (to, message) => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  await transporter.sendMail({
    from: `"Bazaar Support" <${process.env.EMAIL_USER}>`,
    to,
        subject: "bazaar has been approved ",
      html: `
       <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:30px;">
         <div style="max-width:500px; margin:auto; background:#ffffff; padding:25px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
          <h2 style="color:#333; text-align:center;">Welcome Dear </h2>
    <p style="font-size:15px; color:#555; text-align:center;">${message}</p>
    </div>
    </div>
    
    `
      ,
  });
};
module.exports=sendMessageEmail