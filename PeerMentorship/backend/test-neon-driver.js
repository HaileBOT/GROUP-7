require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

console.log('Testing Neon Serverless driver...');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.connect().then(client => {
    console.log('✅ Connected with Neon driver!');
    return client.query('SELECT version()').then(res => {
        console.log('✅ Query success:', res.rows[0]);
        client.release();
        process.exit(0);
    });
}).catch(err => {
    console.error('❌ Neon driver failed:', err);
    process.exit(1);
});
