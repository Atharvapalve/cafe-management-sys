import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log("📨 Using EMAIL_USER:", process.env.EMAIL_USER);
    console.log("📤 Sending OTP email to:", email, "with OTP:", otp);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification - Cafe3",
      text: `Your verification code is: ${otp}\nThis code will expire in 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent via Nodemailer:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    return false;
  }
};




// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}; 