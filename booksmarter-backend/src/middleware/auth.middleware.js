const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  // Add this debugging
  console.log('Auth middleware cookies:', req.cookies);
  console.log('Auth middleware headers:', req.headers);

  const token = req.cookies.authToken; // Read token from cookies
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decodedToken; // Attach user data to the request
    next();
  });
};

module.exports = authenticateToken;