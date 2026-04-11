const auditService = require("../services/auditService.js");
const UAParser = require("ua-parser-js");

//============================ View Audit Logs ============================
const viewAudit = async (req, res) => {
  const auditLogs = await auditService.viewAudiLogService();

  const parser = new UAParser();
  auditLogs.forEach((log) => {
    log.BrowserInfo =
      parser.setUA(log.BrowserInfo).getBrowser().name || "Unknown";
  });

  res.render("./admin/audit.ejs", { auditLogs });
};

module.exports = { viewAudit };
