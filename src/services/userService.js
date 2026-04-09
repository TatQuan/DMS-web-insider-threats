const bcrypt = require("bcrypt");
const { connectionPool, sql } = require("../config/database");
const userModel = require("../models/userModel.js");

// ========================= Create User =========================
const createUserService = async (
  fullName,
  email,
  department,
  role,
  password,
) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return await userModel.createUserQuery(
    fullName,
    email,
    department,
    role,
    hashedPassword,
  );
};

// ==================== View Users ====================
const viewUsersService = async () => {
  return await userModel.selectAllUsersQuery();
};

// ========================= Update User =========================
const updateUserService = async (userId, fullName, email, department, role) => {
  console.log("Updating user with ID:", userId);
  console.log("New data:", { fullName, email, department, role });

  return await userModel.updateUserQuery(
    userId,
    fullName,
    email,
    department,
    role,
  );
};

// ========================= Soft Delete User =========================
const deleteUserService = async (userId) => {
  return await userModel.softDeleteUserQuery(userId);
};

module.exports = {
  createUserService,
  viewUsersService,
  updateUserService,
  deleteUserService,
};
