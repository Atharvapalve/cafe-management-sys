// backend/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/orders.js";
import { router as userRoutes } from "./routes/users.js";

dotenv.config();

const app = express();
app.use("/uploads", express.static("uploads"));

// Express CORS middleware (for your REST API)
app.use(
  cors({
    origin: "https://cafe-management-sys-qqua.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400 // 24 hours
  })
);

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'https://cafe-management-sys-qqua.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with updated CORS options:
const io = new Server(server, {
  cors: {
    origin: "https://cafe-management-sys-qqua.vercel.app",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"]
  },
});

// Attach io instance to app locals for access in routes
app.locals.io = io;

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
