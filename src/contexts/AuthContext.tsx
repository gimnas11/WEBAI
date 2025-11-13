import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserWithRole extends User {
  role?: 'admin' | 'user';
}

interface AuthContextType {
  currentUser: UserWithRole | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseAvailable] = useState(!!auth);

  // Fetch user role from Firestore
  const fetchUserRole = async (user: User): Promise<'admin' | 'user'> => {
    if (!db) return 'user';
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role || 'user';
      } else {
        // Create user document with default role 'user' (untuk user yang sudah ada di Firebase Auth tapi belum ada di Firestore)
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || '',
          role: 'user', // Default role 'user' untuk semua user
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return 'user';
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user';
    }
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please add VITE_FIREBASE_* secrets in GitHub Settings.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Create user document in Firestore with default role 'user'
    // Semua user baru otomatis mendapat role 'user' (bukan admin)
    if (userCredential.user && db) {
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          displayName: displayName || userCredential.user.displayName || '',
          role: 'user', // Default role untuk semua user baru
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }
    
    // Send verification email
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    
    return userCredential;
  };

  const login = async (email: string, password: string): Promise<UserCredential> => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please add VITE_FIREBASE_* secrets in GitHub Settings.');
    }
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    if (!auth) {
      return; // No-op if Firebase not available
    }
    await signOut(auth);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase is not configured.');
    }
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    } else if (currentUser?.emailVerified) {
      throw new Error('Email already verified');
    } else {
      throw new Error('No user logged in');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please add VITE_FIREBASE_* secrets in GitHub Settings.');
    }
    await sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    if (!auth) {
      // Firebase not configured - skip auth state listener
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          if (user) {
            // Fetch user role from Firestore
            const role = await fetchUserRole(user);
            const userWithRole: UserWithRole = { ...user, role };
            setCurrentUser(userWithRole);
          } else {
            setCurrentUser(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Auth state error:', error);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Firebase auth initialization error:', error);
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    sendVerificationEmail,
    resetPassword,
    isEmailVerified: currentUser?.emailVerified || false,
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chat-darker">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

