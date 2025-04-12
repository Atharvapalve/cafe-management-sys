import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import MenuItem from "../models/MenuItem.js";
import { sendOrderStatusSMS } from "../utils/smsService.js";  

const router = express.Router();

// Update order status and emit socket event
router.put("/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Emit socket event
    const io = req.app.locals.io;
    io.emit("orderStatusUpdated", {
      orderId,
      status,
      user: order.user._id.toString(),
    });

    // ✅ Trigger SMS here
    if (order.user?.phone) {
      console.log("📤 Triggering SMS for order:", order._id, "to:", order.user.phone);
      await sendOrderStatusSMS(order.user.phone, status, order._id);
    } else {
      console.log("🚫 No phone number found for user:", order.user?._id);
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// Create a new order
router.post("/", auth, async (req, res) => {
  try {
    const { items, rewardPointsRedeemed } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid or empty items array" });
    }
    if (typeof rewardPointsRedeemed !== "number" || rewardPointsRedeemed < 0) {
      return res.status(400).json({ message: "Invalid reward points redeemed" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (rewardPointsRedeemed > user.wallet.rewardPoints) {
      return res.status(400).json({ message: "Insufficient reward points" });
    }

    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ message: "One or more menu items are invalid" });
    }

    const subtotal = items.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi._id.toString() === item.menuItemId);
      return sum + menuItem.price * item.quantity;
    }, 0);

    const rewardPointsValue = rewardPointsRedeemed * 0.5;
    const total = Math.max(0, subtotal - rewardPointsValue);

    if (user.wallet.balance < total) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const rewardPointsEarned = Math.floor(total * 0.1);

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
    user.wallet.rewardPoints = user.wallet.rewardPoints - rewardPointsRedeemed + rewardPointsEarned;
    await user.save();

    res.status(201).json({
      order: {
        items: order.items.map((item) => ({
          name: item.menuItem.name, // assuming you populate this field later if needed
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        rewardPointsRedeemed: order.rewardPointsRedeemed,
        rewardPointsEarned: order.rewardPointsEarned,
        total: order.total,
      },
      wallet: user.wallet,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

// Order history route for both users and admin
router.get("/history", auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate("items.menuItem", "name price");
    } else {
      orders = await Order.find({ user: req.user.userId })
        .sort({ createdAt: -1 })
        .populate("items.menuItem", "name price");
    }
    res.json(orders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin route to get all orders
router.get("/admin/orders", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.menuItem", "name price")
      .populate("user", "name email");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});
// Example in routes/order.js


export default router;
