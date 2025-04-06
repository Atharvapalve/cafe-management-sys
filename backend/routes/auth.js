import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult, check } from "express-validator";
import User from "../models/User.js";
import { validate } from "../middleware/validate.js";

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

      // No longer using external API to validate email - relying on built-in validation
      // This allows users to register with any valid email format

      // Create a new user
      user = new User({ name, email, password, phone, role : "user" });

      // No need to hash password here as it's done in the User model's pre-save middleware
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role }, // Include the role
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      // Set cookie just like in login
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return data in same format as login
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        wallet: user.wallet || { balance: 0 }
      };

      console.log('Registration successful for:', email);
      res.status(201).json({ token, user: userData });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// backend/routes/auth.js
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Login validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  try {
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    console.log('User found, checking password...');
    console.log('Password from request:', password ? 'Provided' : 'Not provided');
    console.log('Password from DB:', user.password ? `Found (length: ${user.password.length})` : 'Not found');
    
    let isMatch = false;
    try {
      // Try using the User model's verifyPassword method if available
      if (typeof user.verifyPassword === 'function') {
        console.log('Using verifyPassword method');
        isMatch = await user.verifyPassword(password);
      } else {
        console.log('Using bcrypt.compare directly');
        isMatch = await bcrypt.compare(password, user.password);
      }
      console.log('Password comparison result:', isMatch);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).json({ message: 'Error verifying credentials' });
    }

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // User authenticated, send token and user data
    const payload = {
      userId: user.id,
      role: user.role
    };

    // Generate JWT token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set JWT as cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Return the user data (excluding the password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      wallet: user.wallet || { balance: 0 }
    };

    console.log('Login successful for:', email);
    res.json({ token, user: userData });
  } catch (err) {
    console.error('Server error during login:', err.message);
    res.status(500).json({ message: 'Server Error' });
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

// DEBUG ONLY - Test endpoint to verify database connection and hash passwords
router.get("/test-auth", async (req, res) => {
  try {
    // Get a count of all users to verify DB access
    const userCount = await User.countDocuments();
    
    // Create a test password hash to verify bcrypt is working
    const testHash = await bcrypt.hash('testpassword123', 10);
    
    // Verify the hash to check if bcrypt comparison works
    const hashVerification = await bcrypt.compare('testpassword123', testHash);
    
    res.json({
      status: 'success',
      dbConnection: 'ok',
      userCount,
      bcryptWorking: hashVerification,
      testHash: testHash.substring(0, 10) + '...'
    });
  } catch (error) {
    console.error("Auth test error:", error);
    res.status(500).json({ 
      status: 'error',
      message: "Server error during auth test",
      error: error.message
    });
  }
});

// DEBUG ONLY - Test endpoint to check for user by email
router.get("/find-user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Find user without password
    const basicUser = await User.findOne({ email }).lean();
    
    // Find user with password
    const userWithPassword = await User.findOne({ email }).select('+password').lean();
    
    if (!basicUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      status: 'success',
      message: "User found",
      userExists: !!basicUser,
      passwordField: userWithPassword ? "included" : "not included",
      passwordLength: userWithPassword?.password?.length,
      user: {
        _id: basicUser._id,
        id: basicUser._id,  // For comparison
        name: basicUser.name,
        email: basicUser.email,
        role: basicUser.role
      }
    });
  } catch (error) {
    console.error("Find user error:", error);
    res.status(500).json({ 
      status: 'error',
      message: "Server error while finding user",
      error: error.message
    });
  }
});

export default router;