const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccount = require('./firebase-service-account.json');

const bucketName = 'peer-mentorship-44140.appspot.com';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: bucketName
});

const checkBucket = async () => {
  try {
    console.log(`Checking bucket via Admin SDK: ${bucketName}`);
    const bucket = admin.storage().bucket(); // Should use the default one configured above
    
    console.log('Bucket name:', bucket.name);
    
    const [exists] = await bucket.exists();
    console.log(`Bucket exists: ${exists}`);
    
    if (!exists) {
        console.log('Bucket does not exist. Attempting to create...');
        try {
            await bucket.create({
                location: 'US-CENTRAL1', // Default location
            });
            console.log('Bucket created successfully!');
        } catch (createErr) {
            console.error('Error creating bucket:', createErr.message);
        }
    }
    
    if (exists) {
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log(`Successfully listed ${files.length} files.`);
    }

  } catch (err) {
    console.error('ERROR accessing bucket:', err);
  }
};

checkBucket();
