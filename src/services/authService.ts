import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
import { UserProfile } from '../types/models';

export const signUp = async (
  email: string,
  password: string,
  profile: Pick<UserProfile, 'fullName' | 'phone' | 'birthDate' | 'birthTime' | 'plan'>
) => {
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: profile.fullName });
  await setDoc(doc(firestore, 'users', credential.user.uid), {
    uid: credential.user.uid,
    email,
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return credential.user;
};

export const signIn = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
  const auth = getFirebaseAuth();
  await signOut(auth);
};

export const sendResetPassword = async (email: string) => {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
};
