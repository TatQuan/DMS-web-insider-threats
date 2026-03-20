const bcrypt = require("bcrypt");
const { connectionPool, sql } = require("../config/database");

// Create user function
const createUser = async (username, password, fullname, department) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const pool = await connectionPool;
  await pool
    .request()
    .input("user", sql.NVarChar, username)
    .input("pass", sql.NVarChar, hashedPassword)
    .input("name", sql.NVarChar, fullname)
    .input("dept", sql.NVarChar, department)
    .query(
      "INSERT INTO Users (Username, PasswordHash, FullName, Department) VALUES (@user, @pass, @name, @dept)",
    );

  return { success: true };
};

module.exports = {
  createUser,
};
