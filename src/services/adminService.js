const adminModel = require("../models/adminModel");

const getDashboardData = async () => {
  const stats = await adminModel.fetchOverallStats();
  return stats.recordset[0];
};

const unlockTargetUser = async (userId) => {
  return await adminModel.updateUnlockUser(userId);
};

module.exports = { getDashboardData, unlockTargetUser };
