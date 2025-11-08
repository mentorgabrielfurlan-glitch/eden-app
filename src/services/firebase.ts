import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

const firebaseConfig = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: '00000000000',
  appId: '1:00000000000:web:placeholder',
};

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
