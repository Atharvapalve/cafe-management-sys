export const admin = (req, res, next) => {
    console.log("User role in admin middleware:", req.user.role);
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Admin access required" });
    }
  };