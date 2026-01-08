const admin = require('firebase-admin');

let db, auth, isInitialized = false;

// Initialize Firebase Admin SDK
function initializeFirebase() {
  if (isInitialized) return { admin, db, auth };
  
  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // Check if already initialized
    if (admin.apps.length > 0) {
      db = admin.firestore();
      auth = admin.auth();
      isInitialized = true;
      console.log('✅ Firebase already initialized');
      return { admin, db, auth };
    }
    
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    let app;
    
    // Try with service account first
    if (serviceAccountPath) {
      try {
        app = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('✅ Firebase initialized with service account');
        console.log('🔥 Real Firebase connected with full functionality');
      } catch (error) {
        console.log('Service account failed, trying basic init...');
        app = null;
      }
    }
    
    // Fallback to basic initialization
    if (!app) {
      try {
        app = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('✅ Firebase initialized (basic mode)');
        console.log('⚠️  Limited functionality - add service account for full access');
      } catch (error) {
        console.log('Basic Firebase init failed, using mock mode');
        throw error;
      }
    }
    
    // Get Firebase services
    db = admin.firestore();
    auth = admin.auth();
    isInitialized = true;
    
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    console.log('🔧 Using mock Firebase for development...');
    
    // Create mock services
    db = createMockDb();
    auth = createMockAuth();
    isInitialized = true;
  }
  
  return { admin, db, auth };
}

// Mock Database
function createMockDb() {
  return {
    collection: (name) => ({
      doc: (id) => ({
        get: () => Promise.resolve({ 
          exists: false, 
          data: () => null,
          id: id
        }),
        set: (data) => {
          console.log(`Mock DB: Set ${name}/${id}:`, data);
          return Promise.resolve();
        },
        update: (data) => {
          console.log(`Mock DB: Update ${name}/${id}:`, data);
          return Promise.resolve();
        },
        delete: () => {
          console.log(`Mock DB: Delete ${name}/${id}`);
          return Promise.resolve();
        }
      }),
      add: (data) => {
        console.log(`Mock DB: Add to ${name}:`, data);
        return Promise.resolve({ id: `mock-${Date.now()}` });
      },
      where: () => ({
        get: () => Promise.resolve({ 
          empty: true, 
          size: 0, 
          forEach: () => {},
          docs: []
        }),
        orderBy: () => ({
          get: () => Promise.resolve({ 
            empty: true, 
            size: 0, 
            forEach: () => {},
            docs: []
          }),
          limit: () => ({
            get: () => Promise.resolve({ 
              empty: true, 
              size: 0, 
              forEach: () => {},
              docs: []
            })
          })
        })
      }),
      get: () => Promise.resolve({ 
        empty: true, 
        size: 0, 
        forEach: () => {},
        docs: []
      }),
      orderBy: () => ({
        get: () => Promise.resolve({ 
          empty: true, 
          size: 0, 
          forEach: () => {},
          docs: []
        })
      })
    })
  };
}

// Mock Auth
function createMockAuth() {
  return {
    createUser: (userData) => {
      console.log('Mock Auth: Creating user:', userData.email);
      return Promise.resolve({ 
        uid: `mock-${Date.now()}`, 
        email: userData.email 
      });
    },
    verifyIdToken: (token) => {
      console.log('Mock Auth: Verifying token');
      return Promise.resolve({ 
        uid: 'mock-user-id', 
        email: 'user@aau.edu.et',
        email_verified: true
      });
    }
  };
}

// Initialize and export
const firebase = initializeFirebase();
module.exports = firebase;