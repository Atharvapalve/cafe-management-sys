import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
import MenuItem from "../models/MenuItem.js";
// Create a new order
// Create a new order
router.post("/", auth, async (req, res) => {
  try {
    const { items, rewardPointsRedeemed } = req.body;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid or empty items array" });
    }
    if (
      typeof rewardPointsRedeemed !== "number" ||
      rewardPointsRedeemed < 0
    ) {
      return res.status(400).json({ message: "Invalid reward points redeemed" });
    }

    // Fetch the user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate reward points against the user's wallet
    if (rewardPointsRedeemed > user.wallet.rewardPoints) {
      return res.status(400).json({ message: "Insufficient reward points" });
    }

    // Validate and fetch menu items
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ message: "One or more menu items are invalid" });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi._id.toString() === item.menuItemId);
      return sum + menuItem.price * item.quantity;
    }, 0);

    const rewardPointsValue = rewardPointsRedeemed * 0.5;
    const total = Math.max(0, subtotal - rewardPointsValue);

    console.log("Subtotal:", subtotal);
    console.log("Reward Points Redeemed:", rewardPointsRedeemed);
    console.log("Total:", total);

    // Verify user has enough balance
    if (user.wallet.balance < total) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Calculate earned points (10% of total spent)
    const rewardPointsEarned = Math.floor(total * 0.1);

    // Create order
    const order = new Order({
      user: req.user.userId,
      items: items.map((item) => ({
        menuItem: item.menuItemId,
        quantity: item.quantity,
        price: menuItems.find((mi) => mi._id.toString() === item.menuItemId).price,
      })),
      subtotal,
      rewardPointsRedeemed,
      rewardPointsEarned,
      total,
    });

    await order.save();

    // Update user wallet
    user.wallet.balance -= total;
    user.wallet.rewardPoints =
    user.wallet.rewardPoints - rewardPointsRedeemed + rewardPointsEarned;
    await user.save();
    console.log("Subtotal:", subtotal);
    console.log("Reward Points Redeemed:", rewardPointsRedeemed);
    console.log("Total:", total);
    console.log("New Balance:", user.wallet.balance);
    console.log("Reward Points Earned:", Math.floor(total * 0.1));
    console.log("New Reward Points Balance:", user.wallet.rewardPoints);

    // After calculating totals and saving the order
res.status(201).json({
  order: {
    items: order.items.map((item) => ({
      name: item.menuItem.name, // Ensure menu item names are included
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: order.subtotal,
    rewardPointsRedeemed: order.rewardPointsRedeemed,
    rewardPointsEarned: order.rewardPointsEarned,
    total: order.total,
  wallet: user.wallet,
  },
});
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});
router.get("/history", auth, async (req, res) => {
  try {
    console.log("Fetching order history for user:", req.user.userId); // Debugging log
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("items.menuItem", "name price");
      console.log("Orders found:", orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;