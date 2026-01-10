# 🔥 Firebase Setup Guide

This guide will help you set up Firebase for the PeerLearn platform with your project configuration.

## 📋 Prerequisites

- Firebase project: `peer-mentorship-44140`
- Firebase Admin SDK access

## 🔧 Setup Steps

### Step 1: Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `peer-mentorship-44140`
3. Go to **Project Settings** (gear icon)
4. Click on **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Rename it to `firebase-service-account.json`
8. Place it in the `backend/` directory

### Step 2: Configure Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Create database in **production mode**
3. Choose your preferred location
4. Set up security rules (see below)

### Step 3: Enable Authentication

1. Go to **Authentication** in Firebase Console
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Save changes

### Step 4: Firestore Security Rules

Replace the default rules with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for mentor discovery
    }
    
    // Courses are readable by all authenticated users, writable by admins
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Questions are readable by all, writable by owner
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.menteeId;
    }
    
    // Sessions are accessible by participants
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.menteeId || 
         request.auth.uid == resource.data.mentorId);
      allow create: if request.auth != null;
    }
    
    // Messages are accessible by session participants
    match /messages/{messageId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
    
    // Ratings are readable by all, writable by mentees
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.menteeId;
    }
    
    // Logs are admin-only
    match /logs/{logId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 5: Initialize Sample Data

Run the seed script to create initial courses:

```bash
cd backend
node seed.js
```

## 🔐 Environment Variables

Your environment is already configured with:

**Frontend (.env):**
```
REACT_APP_FIREBASE_API_KEY=AIzaSyCpYemkQr6W70mgq9CWaud6heMdnBTrXdY
REACT_APP_FIREBASE_AUTH_DOMAIN=peer-mentorship-44140.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=peer-mentorship-44140
REACT_APP_FIREBASE_STORAGE_BUCKET=peer-mentorship-44140.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=873306240436
REACT_APP_FIREBASE_APP_ID=1:873306240436:web:c41e5960b1e6dd0fc7eee1
```

**Backend (.env):**
```
FIREBASE_PROJECT_ID=peer-mentorship-44140
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

## 🚀 Testing the Setup

1. **Start the backend:**
```bash
cd backend
npm run dev
```

2. **Start the frontend:**
```bash
cd frontend
npm start
```

3. **Test registration:**
   - Go to http://localhost:3000
   - Try registering with an @aau.edu.et email
   - Check Firebase Console for the new user

4. **Verify Firestore:**
   - Check if user document was created in Firestore
   - Verify the data structure matches expectations

## 🐛 Troubleshooting

### Common Issues:

**"Could not load the default credentials"**
- Ensure `firebase-service-account.json` is in the `backend/` directory
- Check that the file is valid JSON
- Verify the file permissions

**"Permission denied" errors**
- Check Firestore security rules
- Ensure user is authenticated
- Verify user roles are set correctly

**Authentication errors**
- Verify Firebase Auth is enabled
- Check that Email/Password provider is enabled
- Ensure API keys are correct

## 📱 Production Deployment

For production deployment:

1. **Update environment variables** on your hosting platform
2. **Upload service account key** securely (not in git)
3. **Update CORS settings** in Firebase
4. **Set production security rules**

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Service account key downloaded and placed
- [ ] Firestore database created
- [ ] Authentication enabled
- [ ] Security rules configured
- [ ] Environment variables set
- [ ] Backend starts without errors
- [ ] Frontend connects to Firebase
- [ ] User registration works
- [ ] Data appears in Firestore

Your Firebase setup is now complete! 🎉