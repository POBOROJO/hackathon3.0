const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Create a new user
router.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
