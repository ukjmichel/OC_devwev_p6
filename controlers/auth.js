const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncWrapper = require('../middlewares/asyncWrapper');

const signup = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    return next(error); // Pass the error to the error-handling middleware
  }

  // Check if the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    return next(error); // Pass the error to the error-handling middleware
  }

  // Create a new user
  const newUser = new User({ email, password });
  await newUser.save();

  res.status(201).json({ message: 'User created successfully' });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    return next(error); // Pass the error to the error-handling middleware
  }

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    return next(error); // Pass the error to the error-handling middleware
  }

  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    return next(error); // Pass the error to the error-handling middleware
  }

  // Create a JWT token with the userId as payload
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET, // Ensure JWT_SECRET is set in your environment variables
    { expiresIn: process.env.JWT_LIFETIME } // Token expires in 1 hour
  );

  // Return the userId and token
  res.status(200).json({ userId: user._id, token });
});

module.exports = { signup, login };
