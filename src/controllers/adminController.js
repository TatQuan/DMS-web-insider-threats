const adminService = require("../services/adminService");

const getStats = async (req, res) => {
  try {
    const data = await adminService.getDashboardData();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving stats: " + err.message });
  }
};

const unlockUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await adminService.unlockTargetUser(userId);
    res.status(200).json({ message: `Unlocked user with ID: ${userId}` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error when unlocking user: " + err.message });
  }
};

module.exports = { getStats, unlockUser };
