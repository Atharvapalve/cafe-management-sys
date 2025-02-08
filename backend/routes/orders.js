import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
// Create a new order
router.post("/", auth, async (req, res) => {
  try {
    const { items } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = new Order({ user: req.user.userId, items, total });
    await order.save();
    res.status(201).json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;