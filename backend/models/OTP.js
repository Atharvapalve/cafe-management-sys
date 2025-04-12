import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Document will be automatically deleted after 10 minutes
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

// Hash OTP before saving
otpSchema.pre("save", async function (next) {
  if (this.isModified("otp")) {
    this.otp = await bcrypt.hash(this.otp, 10);
  }
  next();
});

// Method to verify OTP
otpSchema.methods.verifyOTP = async function(otp) {
  try {
    return await bcrypt.compare(otp, this.otp);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return false;
  }
};

export default mongoose.model("OTP", otpSchema); 