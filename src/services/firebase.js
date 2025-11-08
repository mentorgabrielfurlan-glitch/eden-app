import Constants from 'expo-constants';
import appJson from '../../app.json';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const resolveExtraConfig = () => {
  const sources = [Constants?.expoConfig?.extra, Constants?.manifest?.extra, appJson?.expo?.extra];

  for (const source of sources) {
    if (source && typeof source === 'object' && Object.keys(source).length > 0) {
      return source;
    }
  }

  return {};
};

const extraConfig = resolveExtraConfig();

const firebaseConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
const toEnvKey = (key) => key.replace(/([A-Z])/g, '_$1').toUpperCase();

const firebaseConfigKeyInfo = Object.freeze(
  firebaseConfigKeys.reduce((acc, key) => {
    const envKey = toEnvKey(key);
    const capitalized = capitalize(key);
    acc[key] = {
      envVar: `EXPO_PUBLIC_FIREBASE_${envKey}`,
      extraPaths: [
        `expo.extra.firebase.${key}`,
        `expo.extra.firebaseConfig.${key}`,
        `expo.extra.firebase${capitalized}`,
        `expo.extra.firebase_${envKey.toLowerCase()}`,
      ],
    };
    return acc;
  }, {})
);

const keyVariants = (key) => {
  const envKey = toEnvKey(key);
  const flatKey = key.replace(/[^a-zA-Z0-9]/g, '');
  return [
    key,
    key.toLowerCase(),
    capitalize(key),
    envKey,
    envKey.toLowerCase(),
    envKey.replace(/_/g, ''),
    envKey.replace(/_/g, '').toLowerCase(),
    flatKey,
    flatKey.toLowerCase(),
  ];
};

const getFromExtra = (key) => {
  const nestedSources = [extraConfig?.firebase, extraConfig?.firebaseConfig];
  for (const source of nestedSources) {
    if (!source || typeof source !== 'object') {
      continue;
    }
    for (const variant of keyVariants(key)) {
      if (source[variant] != null) {
        return source[variant];
      }
    }
  }

  const flatPrefixes = [key, `firebase${capitalize(key)}`, `firebase_${toEnvKey(key).toLowerCase()}`];
  for (const prefix of flatPrefixes) {
    for (const variant of keyVariants(prefix)) {
      if (extraConfig[variant] != null) {
        return extraConfig[variant];
      }
    }
  }

  return undefined;
};

const normalizeValue = (value) => {
  if (value == null) {
    return undefined;
  }

  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : undefined;
};

const getFirebaseConfigValue = (key) => {
  const { envVar } = firebaseConfigKeyInfo[key];
  return normalizeValue(process.env?.[envVar]) ?? normalizeValue(getFromExtra(key));
};

const firebaseConfig = firebaseConfigKeys.reduce(
  (config, key) => ({
    ...config,
    [key]: getFirebaseConfigValue(key),
  }),
  {}
);

const missingConfigKeys = firebaseConfigKeys.filter((key) => !firebaseConfig[key]);
const isFirebaseConfigured = missingConfigKeys.length === 0;

if (!isFirebaseConfigured) {
  const readableKeys = missingConfigKeys
    .map((key) => firebaseConfigKeyInfo[key]?.envVar ?? `EXPO_PUBLIC_FIREBASE_${toEnvKey(key)}`)
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

export { app, auth, db, storage, isFirebaseConfigured, missingConfigKeys, firebaseConfigKeyInfo };
