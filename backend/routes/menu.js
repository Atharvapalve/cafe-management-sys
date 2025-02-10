import express from "express";
import MenuItem from "../models/MenuItem.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
// Get all menu items
router.get("/", async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    const menuItems = await MenuItem.find({ ...filter, available: true });

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

// Delete a menu item (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findByIdAndDelete(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
