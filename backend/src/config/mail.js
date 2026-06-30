

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
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
