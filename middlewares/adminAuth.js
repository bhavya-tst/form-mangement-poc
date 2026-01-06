
const adminAuth = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({
      status: 403,
      message: "Forbidden: Invalid Admin Secret",
    });
  }
  next();
};

export default adminAuth;
