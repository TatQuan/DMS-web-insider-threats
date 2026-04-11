const { connectionPool, sql } = require("../config/database");

//============================ View Audit Logs ============================
const selectAuditLogsQuery = async () => {
  const pool = await connectionPool;
  const result = await pool.request().query(`
        SELECT * FROM AuditLogs a
        JOIN Users u ON a.UserId = u.Id
        ORDER BY a.CreatedAt DESC
    `);
  return result.recordset;
};

//============================ Create Audit Log ============================
const insertAuditLogQuery = async (
  userId,
  action,
  resource,
  status,
  ip,
  browser,
) => {
  const pool = await connectionPool;
  return await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("action", sql.NVarChar, action)
    .input("resource", sql.NVarChar, resource)
    .input("status", sql.NVarChar, status)
    .input("ip", sql.NVarChar, ip)
    .input("browser", sql.NVarChar, browser)
    .query(`INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo) 
                VALUES (@userId, @action, @resource, @status, @ip, @browser)`);
};

// Lấy Z-Score từ Database
const calculateZScoreQuery = async (userId) => {
  const pool = await connectionPool;
  const result = await pool.request().input("userId", sql.Int, userId).query(`
        WITH DailyStats AS (
            SELECT UserId, CAST(CreatedAt AS DATE) as LogDate, COUNT(*) as ViolationCount
            FROM AuditLogs
            WHERE Action = 'UNAUTHORIZED_ACCESS'
            GROUP BY UserId, CAST(CreatedAt AS DATE)
        ),
        UserMetrics AS (
            SELECT UserId,
                AVG(CAST(ViolationCount AS FLOAT)) as Mean_Baseline,
                STDEV(ViolationCount) as StdDev_Baseline
            FROM DailyStats
            WHERE LogDate < CAST(GETDATE() AS DATE)
            GROUP BY UserId
        ),
        TodayViolation AS (
            SELECT UserId, ViolationCount as Today_Count
            FROM DailyStats
            WHERE LogDate = CAST(GETDATE() AS DATE)
        )
        SELECT 
            (t.Today_Count - m.Mean_Baseline) / NULLIF(m.StdDev_Baseline, 0) as ZScore
        FROM UserMetrics m
        JOIN TodayViolation t ON m.UserId = t.UserId
        WHERE m.UserId = @userId;
    `);
  return result.recordset[0]?.ZScore || 0;
};

// Thống kê theo giờ (Dùng cho Chart sau này)
const fetchViolationsByHour = async (userId) => {
  const pool = await connectionPool;
  const result = await pool.request().input("userId", sql.Int, userId).query(`
        SELECT DATEPART(HOUR, CreatedAt) as Hour, COUNT(*) as Count
        FROM AuditLogs
        WHERE UserId = @userId AND Action = 'UNAUTHORIZED_ACCESS' 
        AND CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)
        GROUP BY DATEPART(HOUR, CreatedAt)
        ORDER BY Hour
    `);
  return result.recordset;
};

module.exports = {
  selectAuditLogsQuery,
  calculateZScoreQuery,
  insertAuditLogQuery,
  fetchViolationsByHour,
};
