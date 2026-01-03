# Item Management Website with Admin Panel

A complete website with item listing, search functionality, and admin panel for item management. Built with Firebase backend and deployable on Heroku.

## Features

1. **Public Website**:
   - Item listing with search and filter functionality
   - Category-based filtering
   - Responsive design for all devices
   - Attractive UI with animations

2. **Admin Panel**:
   - Secure authentication system
   - Add, edit, and delete items
   - Real-time item management
   - Admin statistics dashboard

3. **Backend**:
   - Firebase Firestore database
   - Firebase Authentication
   - Real-time data updates

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in test mode (for development)
   - Choose a location

4. Enable **Authentication**:
   - Go to Authentication
   - Click "Get Started"
   - Enable Email/Password provider

5. Get your Firebase config:
   - Go to Project Settings ⚙️
   - Scroll to "Your apps" section
   - If no web app, click "</>" to add one
   - Copy the Firebase configuration object

6. Update `firebase-config.js` with your configuration:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };