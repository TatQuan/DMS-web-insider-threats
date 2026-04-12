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

//============================ Get Action Count Each User ============================
const selectActionCountQuery = async (hours = 24) => {
  try {
    const pool = await connectionPool;
    const query = `
          SELECT 
              u.Id, u.FullName, u.Email, 
              COUNT(a.Id) AS ActionCount
          FROM Users u
          LEFT JOIN AuditLogs a 
              ON u.Id = a.UserId 
              AND a.CreatedAt >= DATEADD(hour, -@hours, GETDATE())
          WHERE u.IsDeleted = 0 OR u.IsDeleted IS NULL
          GROUP BY u.Id, u.FullName, u.Email
      `;

    const result = await pool
      .request()
      .input("hours", sql.Int, hours)
      .query(query);

    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching user action counts: ${error.message}`);
  }
};

//============================ Get Anomaly Count ============================
const selectAnomalyCount = async (hours = 24) => {
  try {
    const pool = await connectionPool;
    const query = `
          SELECT COUNT(*) as AnomalyCount 
          FROM AuditLogs 
          WHERE (Status = 'Failed' OR Status = 'Denied') 
          AND CreatedAt >= DATEADD(hour, -@hours, GETDATE())
      `;

    const result = await pool
      .request()
      .input("hours", sql.Int, hours)
      .query(query);

    return result.recordset[0].AnomalyCount;
  } catch (error) {
    throw new Error(`Error fetching anomaly count: ${error.message}`);
  }
};

module.exports = {
  selectAuditLogsQuery,
  selectActionCountQuery,
  insertAuditLogQuery,
  selectAnomalyCount,
};
