const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, createUser } = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Register new user account
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, hashedPassword);
    const userId = newUser._id || newUser.id;

    const token = jwt.sign(
      { userId, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Log in existing user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userId = user._id || user.id;

    const token = jwt.sign(
      { userId, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user profile
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userId = user._id || user.id;
    return res.json({
      success: true,
      user: {
        id: userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
