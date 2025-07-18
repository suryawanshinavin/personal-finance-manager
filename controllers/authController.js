const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    console.log("Login Request Email:", email);

    const user = await User.findOne({ where: { email } });
    console.log("User Found:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Stored Hashed Password:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match Result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("user data", user);

    req.session.userId = user.id;

    res.json({ message: "Login successful", user: user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register function
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // optional
    res.redirect("/");
  });
};
