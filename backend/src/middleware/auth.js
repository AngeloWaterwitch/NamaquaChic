const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    console.error('[auth] JWT verify failed:', err.name, '-', err.message);
    const reason =
      err.name === 'TokenExpiredError' ? 'Session expired — please log in again' :
      err.name === 'JsonWebTokenError' ? `Invalid token (${err.message})` :
      'Invalid or expired token';
    return res.status(401).json({ message: reason });
  }
};
