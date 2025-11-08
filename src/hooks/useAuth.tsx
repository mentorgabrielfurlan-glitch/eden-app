import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { initializeFirebase, listenToAuthChanges } from '../services/firebase';
import { UserProfile } from '../types/models';

interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  birthDate?: string;
  birthTime?: string;
  plan?: UserProfile['plan'];
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signUp: (payload: SignUpPayload) => Promise<UserProfile>;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapFirebaseUserToProfile = async (firebaseUser: User): Promise<UserProfile> => {
  const { firestore } = initializeFirebase();
  const snapshot = await getDoc(doc(firestore, 'users', firebaseUser.uid));
  const firestoreData = snapshot.exists() ? (snapshot.data() as Partial<UserProfile>) : {};

  const userProfile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? firestoreData.email ?? '',
    fullName: firebaseUser.displayName ?? firestoreData.fullName ?? '',
    photoURL: firebaseUser.photoURL ?? firestoreData.photoURL,
    plan: firestoreData.plan ?? 'gratuito',
    phone: firestoreData.phone,
    birthDate: firestoreData.birthDate,
    birthTime: firestoreData.birthTime,
    role: firestoreData.role ?? 'user',
    createdAt: firestoreData.createdAt,
    updatedAt: firestoreData.updatedAt,
  };

  return userProfile;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = initializeFirebase();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await mapFirebaseUserToProfile(firebaseUser);
          setUser(profile);
        } catch (error) {
          console.warn('Erro ao carregar perfil do usuário', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = useCallback(
    async (payload: SignUpPayload) => {
      setLoading(true);
      try {
        const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
        await updateProfile(credential.user, { displayName: payload.fullName });

        const { firestore } = initializeFirebase();
        const userProfile: UserProfile = {
          uid: credential.user.uid,
          email: payload.email,
          fullName: payload.fullName,
          phone: payload.phone,
          birthDate: payload.birthDate,
          birthTime: payload.birthTime,
          plan: payload.plan ?? 'gratuito',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(firestore, 'users', credential.user.uid), {
          ...userProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setUser(userProfile);
        return userProfile;
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await mapFirebaseUserToProfile(credential.user);
        setUser(profile);
        return profile;
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const resetPassword = useCallback(
    async (email: string) => {
      await sendPasswordResetEmail(auth, email);
    },
    [auth]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signUp,
      signIn,
      signOut,
      sendPasswordReset: resetPassword,
    }),
    [user, loading, signUp, signIn, signOut, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
};
