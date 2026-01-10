require('dotenv').config();
const { URL } = require('url');

if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL');
    process.exit(1);
}

try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log('Host:', dbUrl.hostname);
    console.log('Port:', dbUrl.port || '5432');
    console.log('SearchParams:', dbUrl.search);
} catch (error) {
    console.error('Invalid URL:', error);
}
