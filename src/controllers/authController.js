const authService = require("../services/authService.js");
const ipHelper = require("../utils/ipHelper.js");

const getLoginPage = (req, res) => {
  res.render("login.ejs");
};

const login = async (req, res) => {
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
    res.json(result);
  } catch (err) {
    // take care error, return message for React/Postman
    const status = err.statusCode || 401;
    res.status(status).json({
      message: err.message,
      isLocked: err.isLocked || false,
    });
  }
};

module.exports = { getLoginPage, login };
