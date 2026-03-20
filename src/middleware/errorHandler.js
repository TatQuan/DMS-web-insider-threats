const { connectionPool, sql } = require("../config/database");
const auditService = require("../services/auditService");
const ipHelper = require("../utils/ipHelper");

const globalErrorHandler = async (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const userId = req.user?.id || 0;

  const rawIp =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const ipInfo = ipHelper.formatIPv4(rawIp);

  const browserInfo = req.headers["user-agent"] || "Unknown Browser";

  if (err.actionType === "UNAUTHORIZED_ACCESS") {
    try {
      await auditService.logAction(
        userId,
        "UNAUTHORIZED_ACCESS",
        `Resource: ${req.originalUrl}`,
        "Failed",
        ipInfo,
        browserInfo,
      );

      const zScore = await auditService.getZScore(userId);
      const threshold = parseFloat(process.env.DYNAMIC_Z_THRESHOLD) || 3.0;

      console.log(
        `[ANALYZER] User: ${userId} | Z-Score: ${zScore.toFixed(2)} | Threshold: ${threshold} | IP: ${ipInfo}`,
      );

      if (zScore > threshold) {
        await auditService.logAction(
          userId,
          "CRITICAL_ANOMALY",
          `Z-Score (${zScore.toFixed(2)}) > ${threshold}`,
          "BLOCK",
          ipInfo,
          browserInfo,
        );

        const lockUntil = new Date(Date.now() + 30 * 60000); // Khóa 30 phút
        const pool = await connectionPool;

        await pool
          .request()
          .input("userId", sql.Int, userId)
          .input("until", sql.DateTime, lockUntil)
          .query(
            "UPDATE Users SET IsLocked = 1, LockedUntil = @until WHERE Id = @userId",
          );

        return res.status(403).json({
          message:
            "Warning: Account temporarily locked due to suspicious activity.",
          isAnomaly: true,
        });
      }
    } catch (auditError) {
      console.error("Audit Logic Error:", auditError);
    }
  }

  res.status(statusCode).json({ message: err.message });
};

module.exports = globalErrorHandler;
