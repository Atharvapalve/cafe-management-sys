import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: {
    type: String,
    required: true,
  },
  memberSince: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    favoriteCoffee: String,
    preferredMilk: String,
    rewardsTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
  },
  wallet: {
    balance: {
      type: Number,
      default: 0,
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Instance method to verify password
userSchema.methods.verifyPassword = async function(password) {
  try {
    // Use bcrypt.compare to check the provided password against the hashed one
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};

export default mongoose.model("User", userSchema);