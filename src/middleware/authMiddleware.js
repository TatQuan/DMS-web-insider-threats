const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // take token from header "Authorization"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token)
    return res
      .status(401)
      .json({ message: "You need to log in to perform this action" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // save user info from token to request
    next(); // allow to go to next middleware or route handler
  } catch (err) {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

const isAdmin = (req, res, next) => {
  // req.user được tạo ra từ middleware verifyToken trước đó
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "You do not have permission to perform this action" });
  }
};

module.exports = { verifyToken, isAdmin };
