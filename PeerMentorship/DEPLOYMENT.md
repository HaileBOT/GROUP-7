# 🚀 PeerLearn Deployment Guide - Vercel

This guide will help you deploy the PeerLearn platform to Vercel with proper environment variable configuration.

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Your code should be pushed to GitHub
3. **Firebase Project** - Set up Firebase for production (optional for demo)

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "prepare for deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository: `hiruy72/FSE-project`
4. Select **"Import"**

### Step 3: Configure Build Settings

Vercel will auto-detect the project. Configure these settings:

**Framework Preset:** `Create React App`
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `build`
**Install Command:** `npm install`

### Step 4: Set Environment Variables

In the Vercel dashboard, go to **Settings > Environment Variables** and add:

#### 🔥 Firebase Configuration (Frontend)
```
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
```

#### 🌐 API Configuration (Frontend)
```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

#### 🔧 Backend Configuration (if deploying backend to Vercel)
```
FIREBASE_PROJECT_ID=your-firebase-project-id
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## 🎯 Demo Mode Deployment (No Firebase Required)

For a quick demo deployment without Firebase setup:

### Environment Variables for Demo Mode:
```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
REACT_APP_FIREBASE_API_KEY=demo-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=demo-project
REACT_APP_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=demo-app-id
```

## 🔄 Alternative: Deploy Frontend Only

If you want to deploy only the frontend (recommended for demo):

### Step 1: Update API URL for Demo
In `frontend/.env.production`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 2: Deploy Frontend
1. Set **Root Directory** to `frontend`
2. Use the demo environment variables above
3. Deploy

## 🛠 Backend Deployment Options

### Option 1: Vercel Functions (Recommended)
- Backend automatically deploys as serverless functions
- No additional setup required
- Scales automatically

### Option 2: Railway/Render (Alternative)
For more complex backend needs:
1. Deploy backend to Railway or Render
2. Update `REACT_APP_API_URL` to point to your backend URL

## 🔐 Security Considerations

### Production Environment Variables:
- Never commit `.env` files to git
- Use Vercel's environment variable dashboard
- Set different values for development/production

### Firebase Security Rules:
Update your Firestore security rules for production:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Add more specific rules for production
  }
}
```

## 🚀 Post-Deployment Steps

### 1. Test Your Deployment
- Visit your Vercel URL
- Test registration with @aau.edu.et email
- Verify all features work

### 2. Custom Domain (Optional)
1. Go to Vercel dashboard > Domains
2. Add your custom domain
3. Update DNS settings

### 3. Monitor Performance
- Check Vercel Analytics
- Monitor function execution times
- Set up error tracking

## 🐛 Troubleshooting

### Common Issues:

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set

**API Errors:**
- Check function logs in Vercel dashboard
- Verify backend environment variables
- Test API endpoints individually

**Firebase Errors:**
- Verify Firebase configuration
- Check Firebase security rules
- Ensure service account is properly configured

## 📱 Testing Your Deployment

### Test Accounts (Demo Mode):
- **Student:** `hiruy.ugr-1838-16@aau.edu.et` / `demo123`
- **Mentor:** `sarah.chen@aau.edu.et` / `demo123`
- **Admin:** `admin@aau.edu.et` / `demo123`

### Features to Test:
✅ User registration with @aau.edu.et email  
✅ Login and authentication  
✅ Mentor browsing and filtering  
✅ Course exploration  
✅ Messages page functionality  
✅ Profile management  
✅ Responsive design on mobile  

## 🎉 Success!

Your PeerLearn platform is now live! Share the URL with Addis Ababa University students and start building your peer mentorship community.

**Live URL:** `https://your-project-name.vercel.app`

---

Need help? Check the [Vercel Documentation](https://vercel.com/docs) or create an issue in your repository.