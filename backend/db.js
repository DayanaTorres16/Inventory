require('dotenv').config(); // Cargar variables de entorno
const mysql = require('mysql2');

// Configuración segura de la conexión
const connection = mysql.createPool({
  host: process.env.DB_HOST,       
  port: process.env.DB_PORT,      
  user: process.env.DB_USER,       
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,   
  waitForConnections: true,
  connectionLimit: 30, 
  queueLimit: 0,
  timezone: 'Z', 
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined,
  connectTimeout: 10000, 
  // Prevenir inyección SQL
  multipleStatements: false
});

connection.getConnection((err, conn) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
  } else {
    console.log("Conexión a MySQL establecida");
    conn.release();
  }
});

connection.on('error', (err) => {
  console.error('Error en la base de datos:', err.code);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Intentando reconectar a la base de datos...');
  }
});

module.exports = connection;
