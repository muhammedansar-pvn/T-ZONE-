

const nodemailer = require("nodemailer");

//
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (e.g., test@gmail.com)
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (16 characters, generated in Google Account settings)
  },
});


const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"T-ZONE Support" <${process.env.EMAIL_USER}>`, 
    to: to,
    subject: subject, 
    html: html, 
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  sendMail,
};
