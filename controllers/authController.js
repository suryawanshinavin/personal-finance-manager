// controllers/authController.js

const User = require("../models/user");
const bcrypt = require("bcryptjs"); // To hash the password
const jwt = require("jsonwebtoken");

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input data
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ where: { email } });

    // If user is not found, return error message
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials || User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await user.comparePassword(password);

    // If password does not match, return error message
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials || Password does not match" });
    }

    // Generate JWT token, using the user ID as a payload
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send success response with token
    res.json({ message: "Login successful", token });
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    // Return generic server error message
    res.status(500).json({ message: "Server error" });
  }
};

// Register function
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
