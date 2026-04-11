const auditModel = require("../models/auditModel.js");
// ==================== View Audit Logs ====================
const viewAudiLogService = async () => {
  return await auditModel.selectAuditLogsQuery();
};

// ==================== Create Log ====================
const createLogService = async (
  userId,
  action,
  resource,
  status,
  ip,
  browser,
) => {
  try {
    await auditModel.insertAuditLogQuery(
      userId,
      action,
      resource,
      status,
      ip,
      browser,
    );
  } catch (err) {
    console.error("Error in auditService.createLogService:", err.message);
  }
};

const getZScore = async (userId) => {
  try {
    const zScore = await auditModel.calculateZScoreFromDB(userId);
    return zScore;
  } catch (err) {
    console.error("Error in auditService.getZScore:", err.message);
    return 0;
  }
};

// get data draw chart Violation by Hour (0-23)
const getHourlyViolationChart = async (userId) => {
  const data = await auditModel.fetchViolationsByHour(userId);
  const fullDay = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  data.forEach((item) => {
    fullDay[item.Hour].count = item.Count;
  });
  return fullDay;
};

module.exports = {
  viewAudiLogService,
  createLogService,
  getZScore,
  getHourlyViolationChart,
};
