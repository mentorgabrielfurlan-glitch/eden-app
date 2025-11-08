import Constants from 'expo-constants';
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const REQUIRED_CONFIG_KEYS: (keyof FirebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const resolveFirebaseConfig = (): FirebaseConfig => {
  type FirebaseExtra = Partial<FirebaseConfig> | undefined;

  const env = (typeof process !== 'undefined' ? process.env : undefined) as
    | Record<string, string | undefined>
    | undefined;

  const envConfig: Partial<FirebaseConfig> = {
    apiKey: env?.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: env?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env?.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env?.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  const extraConfig = (
    Constants?.expoConfig?.extra?.firebase ??
    Constants?.manifest?.extra?.firebase ??
    (Constants?.manifest2 as { extra?: { expoClient?: { extra?: { firebase?: FirebaseExtra } } } })?.extra
      ?.expoClient?.extra?.firebase ??
    {}
  ) as FirebaseExtra;

  const config: Partial<FirebaseConfig> = {
    ...extraConfig,
    ...envConfig,
  };

  const missingKeys = REQUIRED_CONFIG_KEYS.filter((key) => !config[key]);

  if (missingKeys.length) {
    const missingList = missingKeys.join(', ');
    throw new Error(
      `Missing Firebase configuration values for: ${missingList}. Provide them via EXPO_PUBLIC_FIREBASE_* env vars or expo.extra.firebase.`,
    );
  }

  return config as FirebaseConfig;
};

const firebaseConfig = resolveFirebaseConfig();

/**
 * Inicializa o SDK do Firebase (v9 modular). Substitua os valores acima por variáveis de ambiente
 * seguras (por exemplo, usando dotenv ou Expo Constants) antes de enviar para produção.
 */
export const initializeFirebase = () => {
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseFirestore = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
  }

  return {
    app: firebaseApp!,
    auth: firebaseAuth!,
    firestore: firebaseFirestore!,
    storage: firebaseStorage!,
  };
};

export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) {
    initializeFirebase();
  }
  return firebaseAuth!;
};

export const getFirebaseFirestore = (): Firestore => {
  if (!firebaseFirestore) {
    initializeFirebase();
  }
  return firebaseFirestore!;
};

export const getFirebaseStorage = (): FirebaseStorage => {
  if (!firebaseStorage) {
    initializeFirebase();
  }
  return firebaseStorage!;
};

export const getCurrentUserUid = (): string | null => {
  const auth = getFirebaseAuth();
  return auth.currentUser?.uid ?? null;
};

export const listenToAuthChanges = (callback: Parameters<typeof onAuthStateChanged>[1]) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};
