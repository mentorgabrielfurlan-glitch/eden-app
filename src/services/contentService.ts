import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, where } from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Breathing, Course, Meditation, UserProgress } from '../types/models';

export const getMeditations = async (options?: { tag?: string; level?: string; limitDocs?: number }) => {
  const firestore = getFirebaseFirestore();
  const constraints: any[] = [orderBy('title')];
  if (options?.tag) constraints.unshift(where('tags', 'array-contains', options.tag));
  if (options?.level) constraints.unshift(where('level', '==', options.level));
  if (options?.limitDocs) constraints.push(limit(options.limitDocs));
  const snapshot = await getDocs(query(collection(firestore, 'meditations'), ...constraints));
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...(docSnapshot.data() as Meditation) }));
};

export const getBreathings = async (options?: { level?: string }) => {
  const firestore = getFirebaseFirestore();
  const constraints: any[] = [orderBy('title')];
  if (options?.level) constraints.unshift(where('level', '==', options.level));
  const snapshot = await getDocs(query(collection(firestore, 'breathings'), ...constraints));
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...(docSnapshot.data() as Breathing) }));
};

export const getCourses = async () => {
  const firestore = getFirebaseFirestore();
  const snapshot = await getDocs(collection(firestore, 'courses'));
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...(docSnapshot.data() as Course) }));
};

export const markComplete = async (progress: Omit<UserProgress, 'id'>) => {
  const firestore = getFirebaseFirestore();
  await setDoc(doc(firestore, 'userProgress', `${progress.userId}_${progress.contentId}`), {
    ...progress,
    completedAt: progress.completedAt ?? new Date().toISOString(),
  });
};

export const getCourseById = async (courseId: string) => {
  const firestore = getFirebaseFirestore();
  const snapshot = await getDoc(doc(firestore, 'courses', courseId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Course) };
};
