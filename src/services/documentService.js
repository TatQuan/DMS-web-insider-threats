const documentModel = require("../models/documentModel");
const AppError = require("../utils/appError");
const path = require("path");

const listDocuments = async (userId, userRole, userDept) => {
  return await documentModel.findAll(userRole, userDept);
};

const uploadNewDocument = async (fileData, userId, department) => {
  try {
    return await documentModel.insert(fileData, userId, department);
  } catch (err) {
    throw new AppError("Could not upload document", 500);
  }
};

const getDownloadInfo = async (docId, user) => {
  const document = await documentModel.findById(docId);

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

const deleteDocument = async (docId, user) => {
  const document = await documentModel.findById(docId);
  if (!document) throw new AppError("Document not found", 404);

  // Kiểm tra quyền: Admin HOẶC Chủ sở hữu (OwnerId)
  const isOwner = document.OwnerId === user.id;
  const isAdmin = user.role === "Admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Unauthorized to delete this document", 403);
  }

  return await documentModel.softDelete(docId);
};

module.exports = {
  listDocuments,
  uploadNewDocument,
  getDownloadInfo,
  deleteDocument,
};
