# PeerLearn - Peer Mentorship and Real-Time Academic Support Platform

A comprehensive platform connecting students with peer mentors for real-time academic support and collaborative learning.

## 🚀 Features

- **Peer-to-Peer Mentoring**: Connect students with experienced peer mentors
- **Real-Time Chat**: Instant messaging for academic support sessions
- **Course Management**: Browse and filter courses by department and topics
- **Mentor Discovery**: Find mentors based on skills, courses, and availability
- **Role-Based Dashboards**: Customized experiences for mentees, mentors, and admins
- **Session Management**: Request, accept, and manage mentoring sessions
- **Rating System**: Rate and review mentoring sessions
- **Admin Panel**: Approve mentors and monitor platform activity

## 🛠 Tech Stack

### Frontend
- **React** - Modern UI library with functional components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Context API** - State management for auth and global state
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **Firebase Admin SDK** - Server-side Firebase integration

### Authentication & Database
- **Firebase Auth** - User authentication with email/password
- **Firebase Firestore** - NoSQL document database
- **JWT** - JSON Web Tokens for API authorization

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd peer-mentorship-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Generate a service account key for Firebase Admin SDK
5. Download the service account JSON file and place it in the backend directory

### 4. Environment Configuration

#### Backend Environment (.env in backend directory)

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account-key.json

# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key

# Client Configuration
CLIENT_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

#### Frontend Environment (.env in frontend directory)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
```

### 5. Firestore Security Rules

Set up Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for mentor discovery
    }
    
    // Courses are readable by all authenticated users
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
    }
    
    // Messages are accessible by session participants
    match /messages/{messageId} {
      allow read, create: if request.auth != null;
    }
    
    // Ratings are readable by all, writable by mentees
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Logs are admin-only
    match /logs/{logId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🚀 Running the Application

### Development Mode

```bash
# Start both backend and frontend concurrently
npm run dev

# Or start them separately:

# Start backend (from backend directory)
cd backend
npm run dev

# Start frontend (from frontend directory)
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production mode
cd backend
npm start
```

## 📁 Project Structure

```
peer-mentorship-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Express middlewares
│   │   └── app.js          # Express app setup
│   ├── server.js           # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services
│   │   └── config/         # Configuration files
│   ├── public/
│   └── package.json
├── .env.example           # Environment variables template
└── README.md
```

## 🔐 Authentication Flow

1. Users register with email/password through Firebase Auth
2. User data is stored in Firestore with role assignment
3. JWT tokens are used for API authorization
4. Mentors require admin approval before accessing mentor features

## 🎯 User Roles

### Mentee (Student)
- Browse and search for mentors
- Request mentoring sessions
- Participate in real-time chat
- Rate and review sessions
- View learning progress

### Mentor
- Receive and accept session requests
- Conduct mentoring sessions
- Manage availability and profile
- View mentoring statistics
- Requires admin approval

### Admin
- Approve/reject mentor applications
- Monitor platform activity
- Manage courses and categories
- View system reports and logs

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user data
- `POST /api/auth/verify-2fa` - Verify 2FA (placeholder)

### Users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users` - Get mentors list
- `POST /api/users/mentors/apply` - Apply to become mentor

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (admin only)
- `PUT /api/courses/:id` - Update course (admin only)

### Sessions
- `POST /api/sessions/request` - Request mentoring session
- `POST /api/sessions/:id/accept` - Accept session (mentor)
- `POST /api/sessions/:id/end` - End session
- `GET /api/sessions/active` - Get active sessions
- `GET /api/sessions/logs` - Get session history

### Chat
- `POST /api/chat/messages` - Send message
- `GET /api/chat/messages/:sessionId` - Get session messages

### Ratings
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/:mentorId` - Get mentor ratings

### Admin
- `POST /api/admin/mentors/:id/approve` - Approve mentor
- `GET /api/admin/mentors/pending` - Get pending mentors
- `GET /api/admin/logs` - Get system logs
- `GET /api/admin/reports` - Get system reports

## 🔄 Real-Time Features

The platform uses Socket.IO for real-time communication:

- **Live Chat**: Instant messaging during mentoring sessions
- **Typing Indicators**: Show when users are typing
- **Connection Status**: Display online/offline status
- **Session Management**: Real-time session updates

## 🎨 UI/UX Design

The platform follows the provided Figma design with:

- **Dark Theme**: Modern dark color scheme
- **Responsive Design**: Mobile-first approach
- **Consistent Components**: Reusable UI components
- **Intuitive Navigation**: Clear user flows
- **Accessibility**: WCAG compliant design

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Configure Firebase service account credentials
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Video/voice calling integration
- AI-powered mentor recommendations
- Mobile app development
- Advanced analytics dashboard
- Integration with learning management systems
- Gamification features
- Multi-language support