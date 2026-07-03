const mysql = require('mysql2');
require('dotenv').config();

console.log('🔌 Connecting to database...');
console.log('📋 DB_HOST:', process.env.DB_HOST);
console.log('📋 DB_USER:', process.env.DB_USER);
console.log('📋 DB_NAME:', process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todo_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();
console.log('✅ Database connected');

module.exports = db;