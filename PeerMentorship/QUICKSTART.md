# 🚀 PeerLearn - Quick Start Guide

Get the PeerLearn platform running in 5 minutes!

## ⚡ Quick Setup (Demo Mode)

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### 2. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd peer-mentorship-platform

# Run automatic setup
node setup.js
```

### 3. Start the Platform
```bash
# Start both backend and frontend
npm run dev
```

**That's it!** The platform will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 Demo Features

The platform runs in demo mode with mock Firebase, so you can:

✅ **Browse the landing page** - See the beautiful UI matching the Figma design  
✅ **View mentor listings** - Browse available mentors and their profiles  
✅ **Explore courses** - Check out different course categories  
✅ **Test navigation** - Experience the responsive design  

⚠️ **Note**: Authentication and real-time features require Firebase setup (see below)

## 🔥 Full Setup (With Firebase)

For complete functionality including authentication and real-time chat:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Create **Firestore Database**
5. Generate service account key

### 2. Configure Environment Variables

**Backend (.env)**:
```env
FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
```

### 3. Add Service Account Key
- Download the Firebase service account JSON file
- Place it in the `backend/` directory
- Update the path in `GOOGLE_APPLICATION_CREDENTIALS`

### 4. Restart the Platform
```bash
npm run dev
```

## 🎮 Using the Platform

### As a Student (Mentee)
1. **Register** with email/password
2. **Browse mentors** by subject or skills
3. **Request sessions** with mentors
4. **Chat in real-time** during sessions
5. **Rate and review** mentors after sessions

### As a Mentor
1. **Register** and apply to be a mentor
2. **Wait for admin approval**
3. **Accept session requests** from students
4. **Provide guidance** through chat
5. **Build your reputation** through ratings

### As an Admin
1. **Approve mentor applications**
2. **Monitor platform activity**
3. **Manage users and content**
4. **View analytics and reports**

## 🛠 Development Commands

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Start backend only
cd backend && npm run dev

# Start frontend only
cd frontend && npm start

# Build for production
cd frontend && npm run build
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
taskkill /PID <process-id> /F

# Or use different port in backend/.env
PORT=5001
```

### Firebase Errors
- Check your Firebase configuration
- Ensure service account key is valid
- Verify Firestore rules are set up

### CSS/Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📱 Mobile Testing

The platform is fully responsive. Test on mobile by:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access via: `http://YOUR_IP:3000`

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the 'build' folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Set environment variables on your hosting platform
# Deploy the backend folder
```

## 📞 Support

- Check the [README.md](README.md) for detailed documentation
- Review the [issues](https://github.com/your-repo/issues) for common problems
- Create a new issue if you need help

---

**Happy Learning! 🎓**