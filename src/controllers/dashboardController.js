const dashboardGet = (req, res) => {
  res.render("./admin/dashboard.ejs");
};

module.exports = { dashboardGet };
