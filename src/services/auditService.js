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

//

const getSecurityReportDataService = async () => {
  const users = await auditModel.selectActionCountQuery(24);
  const anomaliesDetected = await auditModel.selectAnomalyCount(24);

  if (!users || users.length === 0) {
    return {
      overview: {
        highRiskUsers: 0,
        avgZScore: "0.00",
        anomalies: anomaliesDetected,
      },
      userBehaviors: [],
    };
  }

  // Tính toán Z-Score (Mean & Standard Deviation)
  const counts = users.map((u) => u.ActionCount);
  const mean = counts.reduce((acc, val) => acc + val, 0) / counts.length;
  const variance =
    counts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    counts.length;
  let stdDev = Math.sqrt(variance);
  if (stdDev === 0) stdDev = 1;

  let highRiskUsersCount = 0;
  let totalAbsoluteZScore = 0;

  // Cấu hình ngưỡng cảnh báo cố định cho hệ thống nhỏ
  const CRITICAL_ACTION_LIMIT = 100; // Hơn 100 thao tác/ngày là báo động đỏ
  const WARNING_ACTION_LIMIT = 50; // Hơn 50 thao tác/ngày là cảnh báo

  // Phân tích từng user
  const analyzedUsers = users.map((user) => {
    const zScore = (user.ActionCount - mean) / stdDev;
    totalAbsoluteZScore += Math.abs(zScore);

    let threatLevel = "Normal";
    let statusClass = "success";

    // KẾT HỢP LOGIC: Đạt Z-Score cao HOẶC Vượt ngưỡng số lượng tuyệt đối
    if (zScore >= 3 || user.ActionCount >= CRITICAL_ACTION_LIMIT) {
      threatLevel = "Critical";
      statusClass = "danger";
      highRiskUsersCount++;
    } else if (zScore >= 2 || user.ActionCount >= WARNING_ACTION_LIMIT) {
      threatLevel = "Warning";
      statusClass = "warning";
    }

    return {
      ...user,
      ZScore: zScore.toFixed(2),
      ThreatLevel: threatLevel,
      StatusClass: statusClass,
    };
  });

  const avgZScore = (totalAbsoluteZScore / users.length).toFixed(2);

  return {
    overview: {
      highRiskUsers: highRiskUsersCount,
      avgZScore: avgZScore,
      anomalies: anomaliesDetected,
    },
    // Sắp xếp rủi ro cao lên đầu
    userBehaviors: analyzedUsers.sort((a, b) => {
      // Ưu tiên xếp người có ThreatLevel Critical lên trước
      if (a.ThreatLevel === "Critical" && b.ThreatLevel !== "Critical")
        return -1;
      if (b.ThreatLevel === "Critical" && a.ThreatLevel !== "Critical")
        return 1;
      // Sau đó mới xếp theo ActionCount hoặc ZScore
      return b.ActionCount - a.ActionCount;
    }),
  };
};

// const getSecurityReportDataService = async () => {
//   const users = await auditModel.selectActionCountQuery(24);
//   const anomaliesDetected = await auditModel.selectAnomalyCount(24);

//   if (!users || users.length === 0) {
//     return {
//       overview: {
//         highRiskUsers: 0,
//         avgZScore: "0.00",
//         anomalies: anomaliesDetected,
//       },
//       userBehaviors: [],
//     };
//   }

//   // Calculate Z-Score (Mean & Standard Deviation)
//   const counts = users.map((u) => u.ActionCount);
//   const mean = counts.reduce((acc, val) => acc + val, 0) / counts.length;
//   const variance =
//     counts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
//     counts.length;
//   let stdDev = Math.sqrt(variance);
//   if (stdDev === 0) stdDev = 1;

//   let highRiskUsersCount = 0;
//   let totalAbsoluteZScore = 0;

//   // Analyze each user
//   const analyzedUsers = users.map((user) => {
//     const zScore = (user.ActionCount - mean) / stdDev;
//     totalAbsoluteZScore += Math.abs(zScore);

//     let threatLevel = "Normal";
//     let statusClass = "success";

//     if (zScore >= 3) {
//       threatLevel = "Critical";
//       statusClass = "danger";
//       highRiskUsersCount++;
//     } else if (zScore >= 2) {
//       threatLevel = "Warning";
//       statusClass = "warning";
//     }

//     return {
//       ...user,
//       ZScore: zScore.toFixed(2),
//       ThreatLevel: threatLevel,
//       StatusClass: statusClass,
//     };
//   });

//   const avgZScore = (totalAbsoluteZScore / users.length).toFixed(2);

//   // 4. Trả về format chuẩn để Controller sử dụng
//   return {
//     overview: {
//       highRiskUsers: highRiskUsersCount,
//       avgZScore: avgZScore,
//       anomalies: anomaliesDetected,
//     },
//     // Sắp xếp user có Z-Score cao nhất lên đầu
//     userBehaviors: analyzedUsers.sort((a, b) => b.ZScore - a.ZScore),
//   };
// };

module.exports = {
  viewAudiLogService,
  createLogService,
  getSecurityReportDataService,
};
