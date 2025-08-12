import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success:false, message:'Missing token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(403).json({ success:false, message:'Invalid token' });
  }
}
