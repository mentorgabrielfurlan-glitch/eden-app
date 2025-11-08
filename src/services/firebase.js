import Constants from 'expo-constants';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const extraConfig = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extraConfig.firebaseApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extraConfig.firebaseAuthDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extraConfig.firebaseProjectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extraConfig.firebaseStorageBucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? extraConfig.firebaseMessagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extraConfig.firebaseAppId,
};

const toEnvKey = (key) => key.replace(/([A-Z])/g, '_$1').toUpperCase();

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const isFirebaseConfigured = missingConfigKeys.length === 0;

if (!isFirebaseConfigured) {
  const readableKeys = missingConfigKeys
    .map((key) => `EXPO_PUBLIC_FIREBASE_${toEnvKey(key)}`)
    .join(', ');

  console.warn(
    `Firebase configuration is incomplete. The following environment variables are missing: ${readableKeys}.\n` +
      'Define them in your Expo app config (expo.extra) or as EXPO_PUBLIC_* env vars before starting Expo to enable the signup flow.'
  );
}

const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, db, storage, isFirebaseConfigured, missingConfigKeys };
