# 👤 Frontend - Module A (Auth & Identity)

## 📌 Overview
This module contains the **Authentication and User Identity** components for the Peer Mentorship Platform. It handles the initial user journey from landing page to registration/login and profile management.

### **Responsibilities:**
*   ✅ **Landing Page:** Public-facing home page.
*   ✅ **Authentication:** Login and Registration forms.
*   ✅ **State Management:** Global Auth Context (tracking user login status).
*   ✅ **Profile:** User settings and profile modification.
*   ✅ **Security:** Route protection (redirecting unauthenticated users).

---

## 📂 Key Files & Structure

### **1. Pages (`src/pages/`)**
*   `LandingPage.js` - The main entry point for visitors.
*   `LoginPage.js` - User sign-in interface.
*   `RegisterPage.js` - New user account creation.
*   `ProfilePage.js` - View and edit user details/skills.

### **2. Context (`src/context/`)**
*   `AuthContext.js` - Manages the global state (isUserLoggedIn, userData, etc.).

### **3. Components (`src/components/`)**
*   `ProtectedRoute.js` - A wrapper component that checks if a user is allowed to access private pages (like Dashboard).
*   `Layout.js` - The main container for page content.

---

## 🚀 How to Run

1. **Install Dependencies** (if not already done):
   ```bash
   npm install
