const getDocuments = (req, res) => {
  res.render("./document/upload.ejs");
};

const uploadDocument = (req, res) => {
  res.render("./document/uploadFile.ejs");
};

module.exports = { getDocuments, uploadDocument };
