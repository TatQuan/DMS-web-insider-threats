const { connectionPool, sql } = require("../config/database");

const findAll = async (userRole, userDept) => {
  const pool = await connectionPool;
  let query = `SELECT * FROM Documents WHERE 1=1 AND IsDeleted = 0`;
  const request = pool.request();

  if (userRole !== "Admin") {
    query += ` AND Department = @dept`;
    request.input("dept", sql.NVarChar, userDept);
  }

  const result = await request.query(query);
  return result.recordset;
};

const insert = async (fileData, userId, department) => {
  const pool = await connectionPool;
  const result = await pool
    .request()
    .input("FileName", sql.NVarChar, fileData.originalname)
    .input("FilePath", sql.NVarChar, fileData.filename)
    .input("OwnerId", sql.Int, userId)
    .input("Department", sql.NVarChar, department)
    .input("size", sql.Int, fileData.size).query(`
        INSERT INTO Documents (FileName, FilePath, OwnerId, Department, FileSize) 
        VALUES (@FileName, @FilePath, @OwnerId, @Department, @size);
        SELECT SCOPE_IDENTITY() AS id;
    `);
  return result.recordset[0].id;
};

const findById = async (docId) => {
  const pool = await connectionPool;
  const result = await pool
    .request()
    .input("id", sql.Int, docId)
    .query("SELECT * FROM Documents WHERE Id = @id AND IsDeleted = 0");
  return result.recordset[0];
};

const softDelete = async (docId) => {
  const query = `
    UPDATE Documents 
    SET IsDeleted = 1, DeletedAt = GETDATE() 
    WHERE Id = @id
  `;
};

const findRecycleBin = async () => {
  return await sql.query`SELECT * FROM Documents WHERE IsDeleted = 1 ORDER BY DeletedAt DESC`;
};

const restore = async (docId) => {
  return await sql.query`UPDATE Documents SET IsDeleted = 0, DeletedAt = NULL WHERE Id = ${docId}`;
};

module.exports = {
  findAll,
  insert,
  findById,
  softDelete,
  findRecycleBin,
  restore,
};
