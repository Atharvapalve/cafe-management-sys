import express from "express";
import User from "../models/User.js"; // Import the User model
import { auth } from "../middleware/auth.js";
import { admin } from "../middleware/admin.js";
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
// backend/routes/users.js

router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, phone, preferences } = req.body;

    // Find the user by ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only the provided fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (preferences) user.preferences = preferences;
    

    // Save the updated user
    await user.save();

    // Return the updated user
    res.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
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

router.get("/admin/users", auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, "name email phone memberSince");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});