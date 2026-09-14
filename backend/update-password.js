const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  const hash = await bcrypt.hash('admin123', 10);
  console.log('Generated hash:', hash);

  await connection.query(
    'UPDATE usuarios SET password_hash = ? WHERE email = ?',
    [hash, 'admin@sistema.com']
  );

  console.log('Password updated successfully');
  await connection.end();
}

updatePassword().catch(console.error);
