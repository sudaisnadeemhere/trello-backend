import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trello-lite-secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'token is not valid' });
  }
}
