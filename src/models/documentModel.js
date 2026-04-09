const { connectionPool, sql } = require("../config/database");

// ========================= VIEW DOCUMENTS =========================
const selectDocQuery = async (userRole, userDept) => {
  const pool = await connectionPool;
  let query = `SELECT 
                  d.[Id] AS DocumentId,
                  d.[FileName],
                  d.[FilePath],
                  d.[Department] AS DocDepartment,
                  d.[IsPrivate],
                  d.[CreatedAt],
                  d.[FileSize],
                  d.[IsDeleted],
                  u.[Id] AS UserId,
                  u.[FullName] AS OwnerName,
                  u.[Email] AS OwnerEmail,
                  u.[Role] AS UserRole,
                  u.[Department] AS UserDepartment
              FROM [DMS_web].[dbo].[Documents] AS d
              LEFT JOIN [DMS_web].[dbo].[Users] AS u ON d.[OwnerId] = u.[Id]
              WHERE d.[IsDeleted] = 0`;
  const request = pool.request();

  if (userRole !== "Admin") {
    query += ` AND Department = @dept`;
    request.input("dept", sql.NVarChar, userDept);
  }

  const result = await request.query(query);
  return result.recordset;
};

// ========================= UPLOAD DOCUMENT =========================
const insertDocQuery = async (fileData, userId, department) => {
  const pool = await connectionPool;
  const result = await pool
    .request()
    .input("FileName", sql.NVarChar, fileData.FileName)
    .input("FilePath", sql.NVarChar, fileData.FilePath)
    .input("OwnerId", sql.Int, userId)
    .input("Department", sql.NVarChar, department)
    .input("size", sql.Int, fileData.FileSize).query(`
        INSERT INTO Documents (FileName, FilePath, OwnerId, Department, FileSize) 
        VALUES (@FileName, @FilePath, @OwnerId, @Department, @size);
        SELECT SCOPE_IDENTITY() AS id;
    `);
  return result.recordset[0].id;
};

// ========================= SELECT DOCUMENT BY ID =========================
const selectDocByIdQuery = async (docId) => {
  const pool = await connectionPool;
  const result = await pool
    .request()
    .input("id", sql.Int, docId)
    .query(`SELECT * FROM Documents WHERE Id = @id AND IsDeleted = 0`);
  return result.recordset[0];
};

// ========================= SOFT DELETE DOCUMENT =========================
const softDeleteQuery = async (docId) => {
  const query = `
    UPDATE Documents 
    SET IsDeleted = 1, DeletedAt = GETDATE() 
    WHERE Id = @id
  `;
  const pool = await connectionPool;
  return await pool.request().input("id", sql.Int, docId).query(query);
};

// ========================= SELECT DOCUMENT BY DELETED =========================
const selectDocByIsDeletedQuery = async () => {
  const pool = await connectionPool;
  return await pool
    .request()
    .query(
      `SELECT * FROM Documents WHERE IsDeleted = 1 ORDER BY DeletedAt DESC`,
    );
};

// ========================= RESTORE DOCUMENT =========================
const restoreQuery = async (docId) => {
  const pool = await connectionPool;
  return await pool
    .request()
    .query(
      `UPDATE Documents SET IsDeleted = 0, DeletedAt = NULL WHERE Id = @id`,
      { input: { id: sql.Int, value: docId } },
    );
};

module.exports = {
  selectDocQuery,
  insertDocQuery,
  selectDocByIdQuery,
  softDeleteQuery,
  selectDocByIsDeletedQuery,
  restoreQuery,
};
