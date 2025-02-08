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