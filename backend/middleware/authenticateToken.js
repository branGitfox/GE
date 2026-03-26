require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('⚠️ Authentication failed: No token provided');
    return res.sendStatus(401);
  }

  const secret = process.env.JWT_SECRET || '8219';
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    console.log(`✅ Token verified for user: ${user.email} (${user.role})`);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;