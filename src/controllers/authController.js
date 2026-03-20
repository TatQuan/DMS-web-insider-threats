const { connectionPool, sql } = require("../config/database.js");
const authService = require("../services/authService.js");
const ipHelper = require("../utils/ipHelper.js");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const rawIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipInfo = ipHelper.formatIPv4(rawIp);

    const browserInfo = req.headers["user-agent"] || "Unknown Browser";

    const result = await authService.loginUser(
      username,
      password,
      ipInfo,
      browserInfo,
    );

    // return token and user info cho React/Postman
    res.json(result);
  } catch (err) {
    // take care error, return message cho React/Postman
    const status = err.statusCode || 401;
    res.status(status).json({
      message: err.message,
      isLocked: err.isLocked || false,
    });
  }
};

module.exports = { login };
