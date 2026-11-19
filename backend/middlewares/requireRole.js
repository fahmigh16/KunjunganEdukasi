module.exports = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Autentikasi diperlukan.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Akses ditolak. Halaman ini memerlukan hak akses khusus.' });
  }
  next();
};
