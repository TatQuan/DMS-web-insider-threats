const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.SQL_USER || undefined,
  password: process.env.SQL_PASSWORD || undefined,
  server: process.env.SQL_SERVER || "localhost",
  database: process.env.SQL_DATABASE,
  options: {
    trustConnection: true,
    encrypt: process.env.SQL_ENCRYPT === "true",
    trustServerCertificate: true,
    // instanceName: process.env.SQL_INSTANCE_NAME || undefined,
    // domain: process.env.SQL_DOMAIN || "",
  },
  // port: parseInt(process.env.SQL_PORT) || 1433,

  // --- Config Pool ---
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Create a connection pool and export it for use in other modules
const connectionPool = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("--- Connection Pool is ready (SQL Connected) ---");
    return pool;
  })
  .catch((err) => {
    console.error("--- Pool is out or connection error: ", err.message);
    process.exit(1);
  });

module.exports = {
  sql,
  connectionPool,
};
