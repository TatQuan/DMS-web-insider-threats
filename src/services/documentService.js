const documentModel = require("../models/documentModel");
const AppError = require("../utils/appError");
const path = require("path");

// ==================== View List Documents ====================
const viewDocumentService = async (userRole, userDept) => {
  return await documentModel.selectDocQuery(userRole, userDept);
};

// ==================== Upload Document ====================
const uploadDocumentService = async (fileData, userId, department) => {
  console.log("Service - File Data:", fileData);
  console.log("Service - User ID:", userId);
  console.log("Service - Department:", department);
  try {
    return await documentModel.insertDocQuery(fileData, userId, department);
  } catch (err) {
    throw new AppError("Could not upload document", 500);
  }
};

// ==================== Download Document ====================
const downloadDocumentService = async (docId, user) => {
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

  return {
    fullPath: path.join(__dirname, "../../uploads", document.FilePath),
    originalName: document.FileName,
  };
};

// ==================== Soft Delete Document ====================
const deleteDocumentService = async (docId, user) => {
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

  return await documentModel.softDeleteQuery(docId);
};

module.exports = {
  viewDocumentService,
  uploadDocumentService,
  downloadDocumentService,
  deleteDocumentService,
};
