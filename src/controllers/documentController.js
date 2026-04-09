const documentService = require("../services/documentService.js");
const moment = require("moment");
const AppError = require("../utils/appError.js");
const path = require("path");
const multer = require("multer");

// ==================== View List Documents ====================
const viewDocument = async (req, res) => {
  const user = res.locals.user;
  const documents = await documentService.viewDocumentService(
    user.role,
    user.dept,
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

    console.log("Files received:", req.files);

    const user = res.locals.user;

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

    const { fullPath, originalName } =
      await documentService.downloadDocumentService(docId, user);

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

    await documentService.deleteDocumentService(docId, user);

    res.redirect("/documents?deleteSuccess=true");
  } catch (err) {
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
