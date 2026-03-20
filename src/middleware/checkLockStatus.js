const { connectionPool, sql } = require("../config/database");

const checkLockStatus = async (req, res, next) => {
  const userId = req.user.id; // Lấy từ JWT đã decode
  const pool = await connectionPool;

  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query("SELECT IsLocked, LockedUntil FROM Users WHERE Id = @userId");

  const user = result.recordset[0];

  if (user.IsLocked) {
    const now = new Date();
    const lockTime = new Date(user.LockedUntil);

    if (now > lockTime) {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(
          "UPDATE Users SET IsLocked = 0, LockedUntil = NULL WHERE Id = @userId",
        );

      console.log(`[SECURITY] User ${userId} has been automatically unlocked.`);
      return next();
    }

    const minutesLeft = Math.ceil((lockTime - now) / 60000);
    return res.status(403).json({
      message: `Your account is locked due to suspicious activity. Please try again in ${minutesLeft} minutes.`,
      isLocked: true,
    });
  }

  next();
};

module.exports = checkLockStatus;
