const { connectionPool, sql } = require("../config/database");

// ========================= Create User =========================
const createUserQuery = async (
  fullname,
  email,
  department,
  role,
  passwordHash,
) => {
  console.log("Creating user with data:", {
    fullname,
    email,
    department,
    role,
    passwordHash,
  });

  const pool = await connectionPool;
  await pool
    .request()
    .input("email", sql.NVarChar, email)
    .input("name", sql.NVarChar, fullname)
    .input("dept", sql.NVarChar, department)
    .input("role", sql.NVarChar, role)
    .input("pass", sql.NVarChar, passwordHash)
    .query(
      "INSERT INTO Users (Email, PasswordHash, FullName, Department, Role) VALUES (@email, @pass, @name, @dept, @role)",
    );

  return { success: true };
};

// ========================= Find User by Email =========================
const selectUserByEmailQuery = async (email) => {
  const pool = await connectionPool;
  const result = await pool
    .request()
    .input("email", sql.NVarChar, email)
    .query("SELECT * FROM Users WHERE Email = @email");
  return result.recordset[0];
};

// ========================= Unlock User =========================
const unlockUserQuery = async (userId) => {
  const pool = await connectionPool;
  return await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(
      "UPDATE Users SET IsLocked = 0, LockedUntil = NULL WHERE Id = @userId",
    );
};

// ========================= Lock Users =========================
const lockUserQuery = async (userId, lockDurationMinutes) => {
  const pool = await connectionPool;
  const lockUntil = new Date(Date.now() + lockDurationMinutes * 60000);
  return await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("lockUntil", sql.DateTime, lockUntil)
    .query(
      "UPDATE Users SET IsLocked = 1, LockedUntil = @lockUntil WHERE Id = @userId",
    );
};

// ========================= View All Users =========================

const selectAllUsersQuery = async () => {
  const pool = await connectionPool;
  const result = await pool
    .request()
    .query("SELECT * FROM Users WHERE IsDeleted = 0 ORDER BY Id DESC");
  return result.recordset;
};

// ========================= Update User =========================

const updateUserQuery = async (userId, fullname, email, department, role) => {
  console.log("Updating user with ID:", userId);
  console.log("New data:", { fullname, email, department, role });

  const pool = await connectionPool;
  return await pool
    .request()
    .input("id", sql.Int, userId)
    .input("name", sql.NVarChar, fullname)
    .input("email", sql.NVarChar, email)
    .input("dept", sql.NVarChar, department)
    .input("role", sql.NVarChar, role)
    .query(
      `UPDATE Users SET Email = @email, FullName = @name, Department = @dept, Role = @role WHERE Id = @id`,
    );
};

// ========================= Soft Delete User =========================
const softDeleteUserQuery = async (userId) => {
  const pool = await connectionPool;
  return await pool
    .request()
    .input("id", sql.Int, userId)
    .query("UPDATE Users SET IsDeleted = 1 WHERE Id = @id");
};

// ========================= Recycle Bin User =========================

module.exports = {
  createUserQuery,
  selectUserByEmailQuery,
  unlockUserQuery,
  selectAllUsersQuery,
  updateUserQuery,
  softDeleteUserQuery,
};
