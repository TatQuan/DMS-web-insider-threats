const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // take token from header "Authorization"
  const token = req.cookies.token;

  if (!token)
    return res
      .status(401)
      .json({ message: "You need to log in to perform this action" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // save user info from token to request
    res.locals.user = decoded; // also save to res.locals for EJS templates
    next(); // allow to go to next middleware or route handler
  } catch (err) {
    res.status(403).json({ message: "Token expired or invalid" });
    res.locals.user = null;
    req.user = null;
    return res.status(401).redirect("/auth/login"); // redirect to login page if token is invalid or expired
  }
};

const isAdmin = (req, res, next) => {
  // req.user are created by middleware verifyToken before
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "You do not have permission to perform this action" });
  }
};

module.exports = { verifyToken, isAdmin };
