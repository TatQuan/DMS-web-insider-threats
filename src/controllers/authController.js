const authService = require("../services/authService.js");
const ipHelper = require("../utils/ipHelper.js");

const loginGet = (req, res) => {
  res.render("login.ejs");
};

const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const rawIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipInfo = ipHelper.formatIPv4(rawIp);

    const browserInfo = req.headers["user-agent"] || "Unknown Browser";

    const result = await authService.loginUser(
      email,
      password,
      ipInfo,
      browserInfo,
    );

    // return token and user info for React/Postman
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    //for React/Postman, return token and user info in JSON response
    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    // take care error, return message for React/Postman
    const status = err.statusCode || 401;
    res.status(status).json({
      message: err.message,
      isLocked: err.isLocked || false,
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
};

module.exports = { loginGet, loginPost, logout };
