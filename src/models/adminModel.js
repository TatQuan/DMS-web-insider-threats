const { connectionPool, sql } = require("../config/database");

const fetchOverallStats = async () => {
  const pool = await connectionPool;
  return await pool.request().query(`
        SELECT 
            (SELECT COUNT(*) FROM Users WHERE IsLocked = 1) as LockedUsers,
            (SELECT COUNT(*) FROM AuditLogs WHERE Action = 'CRITICAL_ANOMALY' AND CreatedAt > DATEADD(day, -7, GETDATE())) as AnomaliesThisWeek,
            (SELECT COUNT(*) FROM AuditLogs WHERE Action = 'UNAUTHORIZED_ACCESS' AND CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)) as TotalViolationsToday
    `);
};

const updateUnlockUser = async (userId) => {
  const pool = await connectionPool;
  return await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(
      "UPDATE Users SET IsLocked = 0, LockedUntil = NULL WHERE Id = @userId",
    );
};

module.exports = { fetchOverallStats, updateUnlockUser };
