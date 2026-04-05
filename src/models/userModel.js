const { connectionPool, sql } = require("../config/database");

const findByUsername = async (email) => {
  const pool = await connectionPool;
  const result = await pool
    .request()
    .input("email", sql.NVarChar, email)
    .query("SELECT * FROM Users WHERE Email = @email");
  return result.recordset[0];
};

const unlockUser = async (userId) => {
  const pool = await connectionPool;
  return await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(
      "UPDATE Users SET IsLocked = 0, LockedUntil = NULL WHERE Id = @userId",
    );
};

module.exports = { findByUsername, unlockUser };
