const documentService = require("../services/documentService.js");
const moment = require("moment");
const ipHelper = require("../utils/ipHelper.js");
const AppError = require("../utils/appError.js");
const path = require("path");
const multer = require("multer");

// ==================== View List Documents ====================
const viewDocument = async (req, res) => {
  const user = res.locals.user;
  const path = req.originalUrl;

  const rawIp =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const ipInfo = ipHelper.formatIPv4(rawIp);

  const browserInfo = req.headers["user-agent"] || "Unknown Browser";

  const documents = await documentService.viewDocumentService(
    user.role,
    user.dept,
    path,
    ipInfo,
    browserInfo,
  );

  res.render("./document/view.ejs", { documents, moment });
};

// ==================== Upload Document ====================
const uploadDocument = (req, res) => {
  res.render("./document/upload.ejs");
};

const uploadDocumentPost = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("Please select at least one file.");
    }

    const user = res.locals.user;
    const path = req.originalUrl;

    const rawIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipInfo = ipHelper.formatIPv4(rawIp);

    const browserInfo = req.headers["user-agent"] || "Unknown Browser";

    const uploadPromises = req.files.map((file) => {
      const fileData = {
        FileName: file.originalname,
        FilePath: file.path,
        FileSize: file.size, // Convert bytes to KB
      };

      return documentService.uploadDocumentService(
        fileData,
        user.id,
        user.dept,
        path,
        ipInfo,
        browserInfo,
      );
    });

    await Promise.all(uploadPromises);

    res.redirect("/documents?status=success");
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).send("An error occurred while uploading the files.");
  }
};

// ==================== Download Document ====================

const downloadDocument = async (req, res) => {
  try {
    const docId = req.params.id;
    const user = res.locals.user;
    const path = req.originalUrl;

    const { fullPath, originalName } =
      await documentService.downloadDocumentService(
        docId,
        user,
        path,
        ipInfo,
        browserInfo,
      );

    (res.download(fullPath, originalName),
      (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("An error occurred while sending the file.");
        }
      });
  } catch (err) {
    console.error("Error downloading document:", err);
    res.status(500).send("An error occurred while downloading the document.");
  }
};

// ==================== Delete Document ====================

const deleteDocument = async (req, res) => {
  try {
    const docId = req.params.id;
    const user = res.locals.user;
    const path = req.originalUrl;

    const rawIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipInfo = ipHelper.formatIPv4(rawIp);

    const browserInfo = req.headers["user-agent"] || "Unknown Browser";

    await documentService.deleteDocumentService(
      docId,
      user,
      path,
      ipInfo,
      browserInfo,
    );

    res.redirect("/documents?deleteSuccess=true");
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).send("An error occurred while deleting the document.");
  }
};

// ==================== Recycle Bin Document ====================

module.exports = {
  viewDocument,
  uploadDocument,
  uploadDocumentPost,
  downloadDocument,
  deleteDocument,
};
