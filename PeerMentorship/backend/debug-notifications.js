require('dotenv').config();
const { query, initializeDatabase, closeConnection } = require('./src/config/database');

async function debugNotifications() {
  try {
    await initializeDatabase();

    // 1. Check if notifications table exists
    console.log('Checking notifications table...');
    try {
      await query('SELECT count(*) FROM notifications');
      console.log('✅ Notifications table exists');
    } catch (error) {
      console.log('❌ Notifications table does NOT exist or error:', error.message);
      
      // Create table if it doesn't exist
      console.log('Creating notifications table...');
      await query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT,
            data JSONB DEFAULT '{}',
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Notifications table created');
    }

    // 2. Check for admin users
    console.log('Checking for admin users...');
    const admins = await query("SELECT id, email, role FROM users WHERE role = 'admin'");
    console.log(`Found ${admins.length} admin(s):`, admins.map(a => a.email));

    // 3. List notifications for admin
    if (admins.length > 0) {
      const adminId = admins[0].id;
      console.log('Listing notifications for admin:', adminId);
      const notifs = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [adminId]);
      console.log(notifs);
    }

  } catch (error) {
    console.error('Debug script error:', error);
  } finally {
    await closeConnection();
  }
}

debugNotifications();
