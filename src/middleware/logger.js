const { connectionPool, sql } = require("../config/database.js");

const auditLogger = async (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const status = res.statusCode;
    const userId = req.user ? req.user.id : "ANONYMOUS"; // Sẽ có sau khi làm Login

    try {
      const pool = await connectionPool;
      await pool
        .request()
        .input("userId", sql.NVarChar, userId)
        .input("action", sql.NVarChar, method)
        .input("resource", sql.NVarChar, url)
        .input("ip", sql.NVarChar, ip)
        .input("status", sql.Int, status)
        .query(
          "INSERT INTO AuditLogs (UserId, Action, Resource, IPAddress, Status) VALUES (@userId, @action, @resource, @ip, @status)",
        );
    } catch (err) {
      console.error("Error logging audit:", err);
    }
  });
  next();
};

module.exports = auditLogger;
