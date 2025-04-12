// test-email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    // Create a transporter object using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or "gmail"
      auth: {
        user: process.env.EMAIL_USER,      // e.g., cafe.itdep@gmail.com
        pass: process.env.EMAIL_PASSWORD,    // Your generated App Password
      },
    });

    // Define mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "your-personal-email@example.com", // Replace with an email you can check
      subject: "Test Email from Cafe Backend",
      text: "If you receive this email, your SMTP configuration works correctly.",
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
  }
})();
