const mysql = require("mysql2/promise");

/**
 * Pool de conexiones a MySQL.
 * Usa variables de entorno definidas en .env
 * para no exponer credenciales en el código.
 */
const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,   // máximo de conexiones simultáneas
  queueLimit:         0,
});

/* Verificar conexión al iniciar */
pool.getConnection()
  .then((conn) => {
    console.log("✅ Conexión a MySQL establecida.");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Error al conectar a MySQL:", err.message);
    process.exit(1);
  });

module.exports = pool;
