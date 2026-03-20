const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'your_password',
    server: 'localhost', 
    database: 'DMS_web',
    options: {
        instanceName: 'SQLEXPRESS',
        encrypt: false, 
        trustServerCertificate: true
    }
};

async function runDefaultConnection() {
    try {

        let connection = await sql.connect(config);
        console.log("--- Opened connection ---");


        let result = await connection.query('SELECT GETDATE() as CurrentTime');
        console.dir(result.recordset);


        await sql.close();
        console.log("--- Closed connection ---");
        
    } catch (err) {
        console.error("Error:", err);
        await sql.close();
    }
}

runDefaultConnection();