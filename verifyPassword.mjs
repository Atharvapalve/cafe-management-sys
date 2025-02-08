import bcrypt from "bcryptjs";

const plainPassword = "password123"; // Replace with the desired password
const saltRounds = 10; // Number of salt rounds for hashing

// Hash the password
const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);
console.log("Hashed Password:", hashedPassword);