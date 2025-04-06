// debug.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// Initialize environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Command line arguments: node debug.js [command] [param1] [param2]
// Commands:
//   list - Lists all users
//   find [email] - Finds a specific user
//   reset [email] [newpassword] - Resets a specific user's password
//   resetall [newpassword] - Resets all users' passwords to the same value
//
// Examples:
//   node debug.js list
//   node debug.js find user@example.com
//   node debug.js reset user@example.com newpassword123
//   node debug.js resetall password123

const args = process.argv.slice(2);
const command = args[0] || 'list';
const param1 = args[1];
const param2 = args[2];

async function listAllUsers() {
  try {
    const users = await User.find({}).select('-password');
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}, role: ${user.role})`);
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

async function findUser(email) {
  try {
    console.log(`Searching for user with email: ${email}`);
    
    // Find user without password
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found in database.');
      return;
    }
    
    console.log('User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    });
    
    // Find user with password for debugging
    const userWithPassword = await User.findOne({ email }).select('+password');
    
    if (!userWithPassword) {
      console.log('User found but could not retrieve with password field.');
      return;
    }
    
    console.log('Password field exists:', !!userWithPassword.password);
    console.log('Password length:', userWithPassword.password?.length || 0);
    
    // Test a sample password
    const testPassword = 'password123';
    const isMatch = await bcrypt.compare(testPassword, userWithPassword.password);
    console.log(`Test password "${testPassword}" matches:`, isMatch);
  } catch (error) {
    console.error('Error finding user:', error);
  }
}

async function resetUserPassword(email, newPassword) {
  try {
    console.log(`Resetting password for ${email} to "${newPassword}"`);
    
    // Find the user first
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found, cannot reset password.');
      return;
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    console.log('Password has been reset');
    
    // Verify the new password
    const updatedUser = await User.findOne({ email }).select('+password');
    const newMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`New password verified:`, newMatch);
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

async function resetAllPasswords(newPassword) {
  try {
    console.log(`RESETTING ALL USER PASSWORDS to "${newPassword}"`);
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users. Resetting passwords...`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update all users
    const result = await User.updateMany({}, { $set: { password: hashedPassword } });
    console.log(`Updated ${result.modifiedCount} users.`);
    
    console.log('All passwords have been reset');
  } catch (error) {
    console.error('Error resetting all passwords:', error);
  }
}

async function main() {
  try {
    switch (command) {
      case 'list':
        await listAllUsers();
        break;
      case 'find':
        if (!param1) {
          console.log('Error: Email is required for find command');
          break;
        }
        await findUser(param1);
        break;
      case 'reset':
        if (!param1 || !param2) {
          console.log('Error: Both email and new password are required for reset command');
          break;
        }
        await resetUserPassword(param1, param2);
        break;
      case 'resetall':
        if (!param1) {
          console.log('Error: New password is required for resetall command');
          break;
        }
        await resetAllPasswords(param1);
        break;
      default:
        console.log(`Unknown command: ${command}`);
        console.log('Available commands: list, find, reset, resetall');
    }
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    mongoose.disconnect();
  }
}

main(); 