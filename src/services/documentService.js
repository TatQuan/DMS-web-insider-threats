const documentModel = require("../models/documentModel");
const auditService = require("./auditService");
const ipHelper = require("../utils/ipHelper");
const AppError = require("../utils/appError");
const path = require("path");

// ==================== View List Documents ====================
const viewDocumentService = async (userRole, userDept) => {
  return await documentModel.selectDocQuery(userRole, userDept);
};

// ==================== Upload Document ====================
const uploadDocumentService = async (
  fileData,
  userId,
  department,
  path,
  ipInfo,
  browserInfo,
) => {
  try {
    await auditService.createLogService(
      userId,
      "UPLOAD",
      path + "/" + fileData.FileName,
      "Success",
      ipInfo,
      browserInfo,
    );
    return await documentModel.insertDocQuery(fileData, userId, department);
  } catch (err) {
    console.error("Error in uploadDocumentService:", err.message);
    throw new AppError("Could not upload document", 500);
  }
};

// ==================== Download Document ====================
const downloadDocumentService = async (
  docId,
  user,
  path,
  ipInfo,
  browserInfo,
) => {
  const document = await documentModel.selectDocByIdQuery(docId);

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  // Important: Check if user has access to this document
  if (user.role !== "Admin" && document.Department !== user.dept) {
    throw new AppError(
      "You are not authorized to access this document!",
      403,
      "UNAUTHORIZED_ACCESS",
    );
  }

  await auditService.createLogService(
    user.id,
    "DOWNLOAD",
    path + "/" + document.FileName,
    "Success",
    ipInfo,
    browserInfo,
  );

  return {
    fullPath: path.join(__dirname, "../../uploads", document.FilePath),
    originalName: document.FileName,
  };
};

// ==================== Soft Delete Document ====================
const deleteDocumentService = async (
  docId,
  user,
  path,
  ipInfo,
  browserInfo,
) => {
  const document = await documentModel.selectDocByIdQuery(docId);
  if (!document) throw new AppError("Document not found", 404);

  console.log("Delete Service - Document:", document);
  console.log("Delete Service - DocID:", docId);
  console.log("Delete Service - User:", user);

  const isOwner = document.OwnerId === user.id;
  const isAdmin = user.role === "Admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Unauthorized to delete this document", 403);
  }

  await auditService.createLogService(
    user.id,
    "DELETE",
    path + "/" + document.FileName,
    "Success",
    ipInfo,
    browserInfo,
  );

  return await documentModel.softDeleteQuery(docId);
};

module.exports = {
  viewDocumentService,
  uploadDocumentService,
  downloadDocumentService,
  deleteDocumentService,
};
