const { getAllUsers } = require("../services/crudUser.js");

const getHomePage = async (req, res) => {
  let users = await getAllUsers();

  res.render("home.ejs", { users });
};

module.exports = {
  getHomePage: getHomePage,
};
