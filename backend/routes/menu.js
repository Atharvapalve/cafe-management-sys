import express from "express";
import MenuItem from "../models/MenuItem.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
// Get all menu items
router.get("/", async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ available: true });
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Add a new menu item (admin only)
router.post("/", auth, async (req, res) => {
  try {
    const { name, price, category, rewardPoints, description, image } = req.body;
    const menuItem = new MenuItem({
      name,
      price,
      category,
      rewardPoints,
      description,
      image,
    });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
