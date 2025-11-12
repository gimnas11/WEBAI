import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration
// Config dari Firebase Console: https://console.firebase.google.com/ → Project Settings → Your apps
// IMPORTANT: Set semua environment variables di .env file (untuk local) atau di GitHub Secrets (untuk production)
// JANGAN hardcode API keys di source code!

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Validate that all required environment variables are set
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId;

if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase configuration is missing. Authentication features will be disabled.');
  console.warn('📝 To enable Firebase: Add VITE_FIREBASE_* secrets in GitHub Settings → Secrets and variables → Actions');
}

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    // Don't throw - allow app to continue without Firebase
    app = null;
    auth = null;
  }
} else {
  console.warn('⚠️ Firebase not initialized - authentication disabled');
}

export { auth };
export default app;

