import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

import { auth, db, isFirebaseConfigured } from './firebase';
import {
  createLocalUser,
  getLocalCurrentUser,
  sendLocalPasswordReset,
  signInLocalUser,
  updateLocalCurrentUser,
} from './localAuthStorage';

const shouldFallbackToLocal = (error) => {
  if (!error) {
    return false;
  }

  const { code, message } = error;
  if (code === 'auth/configuration-not-found' || code === 'auth/app-deleted') {
    return true;
  }

  if (code === 'auth/network-request-failed') {
    return true;
  }

  if (typeof message === 'string' && message.toLowerCase().includes('configuration_not_found')) {
    return true;
  }

  if (typeof message === 'string' && message.toLowerCase().includes('api has not been used')) {
    return true;
  }

  return false;
};

const toFirestorePayload = ({ fullName, email, phone, birthDate, plan }) => ({
  fullName: fullName ?? '',
  email: email ?? '',
  phone: phone ?? '',
  birthDate: birthDate ? Timestamp.fromDate(birthDate) : null,
  plan: plan ?? 'gratuito',
  createdAt: serverTimestamp(),
});

export const signUpUser = async ({ fullName, email, phone, password, birthDate, plan }) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await setDoc(doc(db, 'users', user.uid), toFirestorePayload({
        fullName,
        email: normalizedEmail,
        phone,
        birthDate,
        plan,
      }));

      return { origin: 'firebase', user };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const localUser = await createLocalUser({
    fullName,
    email: normalizedEmail,
    phone,
    password,
    birthDate,
    plan,
  });

  return { origin: 'local', user: localUser };
};

const mapFirebaseAuthError = (error) => {
  const knownMessages = {
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
    'auth/invalid-email': 'O endereço de e-mail não é válido.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/missing-password': 'Informe uma senha.',
    'auth/operation-not-allowed': 'O método de autenticação está desabilitado.',
  };

  if (knownMessages[error?.code]) {
    const friendly = new Error(knownMessages[error.code]);
    friendly.code = error.code;
    return friendly;
  }

  return error;
};

export const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured) {
    try {
      const credentials = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      return { origin: 'firebase', user: credentials.user };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw mapFirebaseAuthError(error);
      }
    }
  }

  const user = await signInLocalUser(normalizedEmail, password);
  return { origin: 'local', user };
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured) {
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      return { origin: 'firebase' };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw mapFirebaseAuthError(error);
      }
    }
  }

  const { temporaryPassword } = await sendLocalPasswordReset(normalizedEmail);
  return { origin: 'local', temporaryPassword };
};

export const fetchUserProfile = async () => {
  if (isFirebaseConfigured && auth.currentUser) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        return { origin: 'firebase', profile: snapshot.data() };
      }

      return { origin: 'firebase', profile: { phone: '', birthTime: '', plan: '' } };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const localUser = await getLocalCurrentUser();
  if (!localUser) {
    const error = new Error('Nenhum usuário autenticado.');
    error.code = 'local/no-user';
    throw error;
  }

  const profile = {
    phone: localUser.phone ?? '',
    birthTime: localUser.birthTime ?? '',
    plan: localUser.plan ?? '',
  };

  return { origin: 'local', profile };
};

export const updateUserProfile = async (updates) => {
  if (isFirebaseConfigured && auth.currentUser) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, updates, { merge: true });
      return { origin: 'firebase' };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  await updateLocalCurrentUser(updates);
  return { origin: 'local' };
};
