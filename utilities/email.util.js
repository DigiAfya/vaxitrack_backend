const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html: htmlContent,
    };

    await sgMail.send(msg);

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error.response?.body || error.message);
  }
};

module.exports = { sendEmail };
