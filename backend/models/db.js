const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'zaq1xsw2cde3#Edik', 
    database: process.env.DB_NAME || 'kursovadb4sem', 
    port: parseInt(process.env.DB_PORT || '330', 10), 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
console.log('[DB] Ініціалізація пулу з’єднань з конфігурацією:', dbConfig); 

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then(connection => {
        console.log('[DB] Пул з’єднань успішно підключено до бази даних!');
        connection.release();
    })
    .catch(err => {
        console.error('----------------------------------------------------');
        console.error('[DB ERROR] Помилка ініціалізації пулу з’єднань при старті:', err.message);
        console.error('Стек викликів:', err.stack);
        console.error('Об\'єкт помилки:', err);
        console.error('----------------------------------------------------');
    });

module.exports = pool;