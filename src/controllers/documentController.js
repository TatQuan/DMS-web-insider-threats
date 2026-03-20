const documentService = require("../services/documentService.js");
const auditService = require("../services/auditService.js");
const AppError = require("../utils/appError.js");
const ipHelper = require("../utils/ipHelper.js");

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("File is required", 400);

    const { id, dept } = req.user;
    const rawIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipInfo = ipHelper.formatIPv4(rawIp);

    const browserInfo = req.headers["user-agent"] || "Unknown Browser";

    const docId = await documentService.uploadNewDocument(req.file, id, dept);

    // write log success
    await auditService.logAction(
      id,
      "UPLOAD_FILE",
      `File: ${req.file.originalname}`,
      "Success",
      ipInfo,
      browserInfo,
    );

    res.status(201).json({ message: "Upload successful", docId });
  } catch (err) {
    next(err); // push error for Global Error Handler
  }
};

const getDocs = async (req, res, next) => {
  try {
    const docs = await documentService.listDocuments(
      req.user.id,
      req.user.role,
      req.user.dept,
    );
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const fileInfo = await documentService.getDownloadInfo(
      req.params.id,
      req.user,
    );

    const rawIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipInfo = ipHelper.formatIPv4(rawIp);

    const browserInfo = req.headers["user-agent"] || "Unknown Browser";

    await auditService.logAction(
      req.user.id,
      "DOWNLOAD_FILE",
      `File: ${fileInfo.originalName}`,
      "Success",
      ipInfo,
      browserInfo,
    );

    res.download(fileInfo.fullPath, fileInfo.originalName);
  } catch (err) {
    next(err); // if error 403 from Service, it will flow down to the Error Handler below
  }
};

const deleteDoc = async (req, res, next) => {
  try {
    await documentService.deleteDocument(req.params.id, req.user);
    const rawIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipInfo = ipHelper.formatIPv4(rawIp);

    const browserInfo = req.headers["user-agent"] || "Unknown Browser";

    await auditService.logAction(
      req.user.id,
      "DELETE_DOC",
      `ID: ${req.params.id}`,
      "Success",
      ipInfo,
      browserInfo,
    );

    res.json({ message: "Delete successful" });
  } catch (err) {
    next(err);
  }
};

const getRecycleBin = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin")
      throw new AppError("Only Admin can access Recycle Bin", 403);

    const docs = await documentModel.findRecycleBin();
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadFile,
  getDocs,
  downloadFile,
  deleteDoc,
  getRecycleBin,
};
