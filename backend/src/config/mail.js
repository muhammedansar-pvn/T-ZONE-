// config/mail.js
// This configuration file sets up Nodemailer using Gmail SMTP to send emails.
// It reads Gmail SMTP credentials from environment variables (.env file).

const nodemailer = require("nodemailer");

// 1. Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (e.g., test@gmail.com)
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (16 characters, generated in Google Account settings)
  },
});

// 2. Helper function to send email
// It takes target recipient, subject line, and HTML template as parameters
const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"T-ZONE Support" <${process.env.EMAIL_USER}>`, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html, // html body content
  };

  // Send the email using the transporter
  return await transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  sendMail,
};
