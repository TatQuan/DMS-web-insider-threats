const auditService = require("../services/auditService.js");

const dashboardGet = async (req, res) => {
  try {
    const reportData = await auditService.getSecurityReportDataService();

    // Render ra file EJS và truyền data vào

    console.log(reportData);

    res.render("./admin/dashboard.ejs", reportData);
  } catch (error) {
    console.error(
      "[DashboardController] Error rendering security dashboard:",
      error,
    );
    // Có thể render ra một trang lỗi 500 riêng thay vì send text
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { dashboardGet };
