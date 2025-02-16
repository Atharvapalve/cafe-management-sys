import express from "express";
import User from "../models/User.js"; // Import the User model
import { auth } from "../middleware/auth.js";
const router = express.Router();
export { router };
// Example route

console.log("User Model:", User);
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add funds to wallet
router.post("/wallet/add", auth, async (req, res) => {
  try {
    const { amount } = req.body; // Extract the amount from the request body
    const user = await User.findById(req.user.userId); // Find the user by ID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.wallet.balance += amount; // Add the amount to the wallet balance
    await user.save(); // Save the updated user document
    res.json(user); // Respond with the updated balance
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});