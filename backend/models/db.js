const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Помилка підключення до MySQL:', err);
  } else {
    console.log('✅ Підключено до MySQL');
  }
});

module.exports = db;
