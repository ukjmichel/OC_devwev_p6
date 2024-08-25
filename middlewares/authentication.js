const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  // Check for the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Respond with a JSON object and proper status code for invalid authentication
    return res.status(401).json({ message: 'Authentication invalid' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request object
    req.user = { userId: payload.userId, name: payload.name };

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Respond with a JSON object and proper status code for token verification errors
    return res.status(401).json({ message: 'Authentication invalid' });
  }
};

module.exports = auth;
