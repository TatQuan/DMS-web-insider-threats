const { connectionPool, sql } = require("../config/database.js");

const insertAccessAuditLog = async (req, res, next) => {
  try {
    const pool = await connectionPool;
    await pool
      .request()
      .query(
        `
      INSERT INTO AuditLogs (UserId, Action, Resource, Status, IPAddress, BrowserInfo)
      VALUES (@userId, @action, @resource, @status, @ip, @browser)
    `,
      )
      .input("userId", sql.Int, req.session.userId || null)
      .input("action", sql.NVarChar, req.method + " " + req.originalUrl)
      .input("resource", sql.NVarChar, req.originalUrl)
      .input("status", sql.NVarChar, "Success")
      .input("ip", sql.NVarChar, req.ip)
      .input("browser", sql.NVarChar, req.headers["user-agent"] || "Unknown");
  } catch (err) {
    console.error("Error inserting audit log:", err.message);
  }
  next();
};

module.exports = insertAccessAuditLog;
