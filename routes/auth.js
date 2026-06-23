const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { users: usersFallback } = require('../data/fallback');

const router = express.Router();

const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    // Try DB-backed flow
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'trello-lite-secret', { expiresIn: '12h' });

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('DB register error:', err.message);
    // Fallback to in-memory store
    try {
      if (usersFallback.find((u) => u.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = { id: generateId(), name, email, password: hashedPassword };
      usersFallback.push(newUser);
      const payload = { user: { id: newUser.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'trello-lite-secret', { expiresIn: '12h' });
      return res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (fallbackErr) {
      console.error('Fallback register error:', fallbackErr.message);
      return res.status(500).json({ message: 'Server error' });
    }
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Please enter both email and password' });

  try {
    // Try DB-backed flow but handle DB errors separately so we can fallback
    let dbUser = null;
    try {
      dbUser = await User.findOne({ email });
    } catch (dbErr) {
      console.error('DB login error:', dbErr.message);
      dbUser = null;
    }

    if (dbUser) {
      const isMatch = await bcrypt.compare(password, dbUser.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      const payload = { user: { id: dbUser.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'trello-lite-secret', { expiresIn: '12h' });
      return res.json({ token, user: { id: dbUser.id, name: dbUser.name, email: dbUser.email } });
    }

    // Try in-memory fallback
    const fbUser = usersFallback.find((u) => u.email === email);
    if (fbUser) {
      const isMatch = await bcrypt.compare(password, fbUser.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      const payload = { user: { id: fbUser.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'trello-lite-secret', { expiresIn: '12h' });
      return res.json({ token, user: { id: fbUser.id, name: fbUser.name, email: fbUser.email } });
    }

    return res.status(400).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login handler error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
