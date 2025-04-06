import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { validate } from "../middleware/validate.js";
import axios from "axios";

const router = express.Router();

// Registration route
router.post(
  "/register",
  validate([
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("phone").notEmpty().withMessage("Phone number is required")
      .matches(/^[0-9]{10}$/).withMessage("Phone must be a valid 10-digit number"),
  ]),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password, phone } = req.body;

      // Check if the user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Verify that the email is real and valid
      try {
        // Using Abstract API's email validation
        const apiKey = process.env.EMAIL_VALIDATION_API_KEY || 'test_key';
        const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`);
        
        // Check if the email is valid and deliverable
        if (!response.data) {
          return res.status(400).json({ message: "Email validation failed. Please use a valid email address." });
        }
        
        const { is_valid_format, is_mx_found, is_smtp_valid, deliverability, domain } = response.data;
        
        if (!is_valid_format) {
          return res.status(400).json({ message: "Email format is invalid" });
        }
        
        if (!is_mx_found) {
          return res.status(400).json({ message: "Email domain does not have valid mail servers" });
        }
        
        if (!is_smtp_valid) {
          return res.status(400).json({ message: "Email address is not valid according to SMTP check" });
        }
        
        if (deliverability === "UNDELIVERABLE") {
          return res.status(400).json({ message: "This email address appears to be undeliverable" });
        }
        
        // Check for common domain typos
        const commonDomains = {
          'gmil.com': 'gmail.com',
          'gmal.com': 'gmail.com',
          'gmail.co': 'gmail.com',
          'gamil.com': 'gmail.com',
          'hotmal.com': 'hotmail.com',
          'hotmail.co': 'hotmail.com',
          'yaho.com': 'yahoo.com',
          'yahooo.com': 'yahoo.com',
          'yahhoo.com': 'yahoo.com',
          'outlook.co': 'outlook.com',
          'outloo.com': 'outlook.com',
        };
        
        if (commonDomains[domain]) {
          return res.status(400).json({ 
            message: `Did you mean ${email.split('@')[0]}@${commonDomains[domain]}? The domain ${domain} appears to be a typo.` 
          });
        }
      } catch (emailValidationError) {
        console.error("Email validation error:", emailValidationError);
        // No longer falling back - instead returning an error
        return res.status(400).json({ 
          message: "Unable to verify email address. Please try again later or use a different email address." 
        });
      }

      // Create a new user
      user = new User({ name, email, password, phone, role : "user" });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role }, // Include the role
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, wallet: user.wallet } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// backend/routes/auth.js
router.post("/login", validate([
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
]), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("User found during login:", user);

    // Generate JWT token with role
    const tokenPayload = { userId: user._id, role: user.role }; // Include the role
    console.log("Generated token payload:", tokenPayload);
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Include the role
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Set the token as a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, wallet: user.wallet } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/logout", (req, res) => {
  try {
    // Clear the token by setting it to an expired value or removing it
    res.clearCookie("token"); // Clear the cookie if using cookies
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;