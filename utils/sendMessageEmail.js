const nodemailer = require("nodemailer");
const sendMessageEmail = async (to, message) => {
  await transporter.sendMail({
    from: `"Bazaar Support" <${process.env.EMAIL_USER}>`,
    to,
        subject: "bazaar has been approved ",
    html: `<p>${message}</p>`,
  });
};
module.exports=sendMessageEmail