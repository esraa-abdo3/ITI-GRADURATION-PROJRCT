const nodemailer = require("nodemailer");

const sendEmail = async (to, otp) => {
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
    subject: "Your Bazaar Verification Code",

    html: `
      <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:30px;">
        
        <div style="max-width:500px; margin:auto; background:#ffffff; padding:25px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
          
          <h2 style="color:#333; text-align:center;">Welcome to Bazaar 👋</h2>

          <p style="font-size:15px; color:#555; text-align:center;">
            Thank you for signing up. To complete your verification, please use the OTP code below:
          </p>

          <div style="text-align:center; margin:30px 0;">
            <span style="
              display:inline-block;
              font-size:28px;
              letter-spacing:8px;
              font-weight:bold;
              background:#f0f0f0;
              padding:12px 20px;
              border-radius:8px;
              color:#111;
            ">
              ${otp}
            </span>
          </div>

          <p style="font-size:14px; color:#777; text-align:center;">
            This code is valid for <b>5 minutes</b>. Do not share it with anyone.
          </p>

          <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />

          <p style="font-size:12px; color:#999; text-align:center;">
            If you did not request this code, you can safely ignore this email.
          </p>

          <p style="font-size:12px; color:#bbb; text-align:center;">
            © ${new Date().getFullYear()} Bazaar. All rights reserved.
          </p>

        </div>
      </div>
    `,
  });
};

module.exports = sendEmail;