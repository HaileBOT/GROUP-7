require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing DB connection...');
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'undefined');

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing!');
    process.exit(1);
}

let connectionString = process.env.DATABASE_URL;
// Strip ALL query params to isolate the issue and rely on ssl object
try {
    const url = new URL(connectionString);
    console.log('Original search params:', url.search);
    url.search = ''; 
    connectionString = url.toString();
    console.log('Cleaned connection string:', connectionString);
} catch (e) {
    console.warn('URL parse failed');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.connect().then(client => {
    console.log('✅ Connected successfully!');
    return client.query('SELECT NOW()').then(res => {
        console.log('✅ Query success. Server time:', res.rows[0].now);
        client.release();
        process.exit(0);
    });
}).catch(err => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
});
