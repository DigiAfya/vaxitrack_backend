const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Pick the right .env file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

console.log(`Loaded environment from ${envFile}`);

// Configure transporter (using Gmail SMTP + App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail account
    pass: process.env.EMAIL_PASS, // 16-character App Password
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Email error:", error.message);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
  }
};

//  weekly summary email to admins
const sendAdminSummary = async (summaryHtml) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await sendEmail(adminEmail, "Weekly Reminder Summary", summaryHtml);
};

module.exports = { sendEmail, sendAdminSummary };
