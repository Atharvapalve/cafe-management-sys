import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,

  },
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
  image: String,
  available: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("MenuItem", menuItemSchema);