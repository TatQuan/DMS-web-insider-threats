require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const auditService = require("./auditService");

const loginUser = async (username, password, ipInfo, browserInfo) => {
  const user = await userModel.findByUsername(username);

  if (!user) {
    await auditService.logAction(
      null,
      "LOGIN_FAILED",
      username,
      "Failed",
      ipInfo,
      browserInfo,
    );
    throw new Error("User not found!");
  }

  const isMatch = await bcrypt.compare(password, user.PasswordHash);
  if (!isMatch) {
    await auditService.logAction(
      user.Id,
      "LOGIN_FAILED",
      "Wrong Password",
      "Failed",
      ipInfo,
      browserInfo,
    );
    throw new Error("Wrong password");
  }

  if (user.IsLocked) {
    const now = new Date();
    const lockUntil = new Date(user.LockedUntil);

    if (now > lockUntil) {
      await userModel.unlockUser(user.Id);
    } else {
      const minutesLeft = Math.ceil((lockUntil - now) / 60000);
      const lockError = new Error(
        `Account temporarily locked. Try again in ${minutesLeft} minutes.`,
      );
      lockError.statusCode = 403;
      lockError.isLocked = true;
      throw lockError;
    }
  }

  // 4. Tạo JWT
  const token = jwt.sign(
    { id: user.Id, role: user.Role, dept: user.Department },
    process.env.JWT_SECRET,
    { expiresIn: "2h" },
  );

  return {
    token,
    user: { id: user.Id, username: user.Username, role: user.Role },
  };
};

const isOutsideWorkingHours = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const startHour = parseInt(process.env.WORKING_HOUR_START) || 8;
  const endHour = parseInt(process.env.WORKING_HOUR_END) || 18;
  const startDay = parseInt(process.env.WORKING_DAY_START) || 1;
  const endDay = parseInt(process.env.WORKING_DAY_END) || 5;

  return day < startDay || day > endDay || hour < startHour || hour >= endHour
    ? 1
    : 0;
};

module.exports = { loginUser, isOutsideWorkingHours };
