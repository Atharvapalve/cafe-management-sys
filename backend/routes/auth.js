import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult, check } from "express-validator";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { validate } from "../middleware/validate.js";
import { sendOTPEmail, generateOTP } from "../utils/emailService.js";

const router = express.Router();

// Step 1: Initial registration route - collect user data and send OTP
router.post(
  "/register/init",
  validate([
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("phone").notEmpty().withMessage("Phone number is required")
      .matches(/^[0-9]{10}$/).withMessage("Phone must be a valid 10-digit number"),
  ]),
  async (req, res) => {
    try {
      console.log("Received registration init data:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password, phone } = req.body;

      // Check if the user already exists - case insensitive but preserving dots
      let existingUser = await User.findOne({ 
        email: { 
          $regex: new RegExp(`^${email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') 
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Generate and store OTP
      const otp = generateOTP();
      
      // Delete any existing OTP for this email
      await OTP.deleteMany({ email });
      
      // Create new OTP document
      const otpDoc = new OTP({
        email,
        otp
      });
      await otpDoc.save();
      console.log("OTP saved")

      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }

      // Store user data temporarily in session or return to client
      // Here we're returning a temporary token that will be used to complete registration
      const tempToken = jwt.sign(
        { email, name, password, phone },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      res.status(200).json({ 
        message: "Verification code sent to your email",
        tempToken
      });
    } catch (error) {
      console.error("Registration initialization error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Step 2: Verify OTP and complete registration
router.post("/register/verify", async (req, res) => {
  try {
    const { otp, tempToken } = req.body;

    if (!otp || !tempToken) {
      return res.status(400).json({ message: "OTP and temporary token are required" });
    }

    // Verify and decode the temporary token
    let decodedToken;
    try {
      decodedToken = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired session" });
    }

    // Find the OTP document
    const otpDoc = await OTP.findOne({ email: decodedToken.email });
    if (!otpDoc) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    // Check attempts
    if (otpDoc.attempts >= 3) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: "Too many attempts. Please request a new OTP" });
    }

    // Verify OTP
    const isValid = await otpDoc.verifyOTP(otp);
    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Create the user
    const user = new User({
      name: decodedToken.name,
      email: decodedToken.email,
      password: decodedToken.password,
      phone: decodedToken.phone,
      role: "user",
      emailVerified: true
    });

    await user.save();

    // Delete the OTP document
    await OTP.deleteOne({ _id: otpDoc._id });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      wallet: user.wallet || { balance: 0 }
    };

    res.status(201).json({ token, user: userData });
  } catch (error) {
    console.error("Registration verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Resend OTP
router.post("/register/resend-otp", async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({ message: "Temporary token is required" });
    }

    // Verify and decode the temporary token
    let decodedToken;
    try {
      decodedToken = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired session" });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: decodedToken.email });
    
    // Create new OTP document
    const otpDoc = new OTP({
      email: decodedToken.email,
      otp
    });
    await otpDoc.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(decodedToken.email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    res.status(200).json({ 
      message: "New verification code sent to your email"
    });
  } catch (error) {
    console.error("OTP resend error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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