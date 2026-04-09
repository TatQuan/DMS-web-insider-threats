const userService = require("../services/userService.js");

// ========================= View Users =========================
const viewUser = async (req, res) => {
  const users = await userService.viewUsersService();

  res.render("./admin/users.ejs", { users });
};

// ========================= Create User =========================

const createUser = async (req, res) => {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const department = req.body.department;
  const role = req.body.role;
  const password = req.body.password;

  console.log("Request Body:", req.body);

  try {
    const newUser = await userService.createUserService(
      fullName,
      email,
      department,
      role,
      password,
    );

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: newUser,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ========================= Update User =========================
const updateUser = async (req, res) => {
  const userId = req.params.id;

  console.log("Request Body:", req.body);

  const fullName = req.body.fullName;
  const email = req.body.email;
  const department = req.body.department;
  const role = req.body.role;
  try {
    await userService.updateUserService(
      userId,
      fullName,
      email,
      department,
      role,
    );

    res
      .status(200)
      .json({ success: true, message: "User updated successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ========================= Delete User =========================
const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await userService.deleteUserService(userId);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ========================== Unlock User =========================

module.exports = { viewUser, createUser, updateUser, deleteUser };
