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

if (missingConfigKeys.length) {
  const readableKeys = missingConfigKeys
    .map((key) => `EXPO_PUBLIC_FIREBASE_${toEnvKey(key)}`)
    .join(', ');

  throw new Error(
    `Firebase configuration is incomplete. Please define the following environment variables: ${readableKeys}.\n` +
      'You can add them to your app config via expo.extra or set them as EXPO_PUBLIC_* env vars before starting Expo.'
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
