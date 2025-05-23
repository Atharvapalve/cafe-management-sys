import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Beverages", "Snacks", "Desserts"],
  },
  rewardPoints: {
    type: Number,
    required: true,
  },
  description: String,
  image: { type: String }, 
  available: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("MenuItem", menuItemSchema);