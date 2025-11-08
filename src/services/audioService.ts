import { ref, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import { getFirebaseStorage } from './firebase';

// Requer `expo-file-system` (instale com `expo install expo-file-system`).

export const getSignedUrl = async (path: string) => {
  const storage = getFirebaseStorage();
  return getDownloadURL(ref(storage, path));
};

export const downloadAudio = async (remoteUrl: string, localFileName: string) => {
  const fileUri = `${FileSystem.documentDirectory}${localFileName}`;
  const result = await FileSystem.downloadAsync(remoteUrl, fileUri);
  return result.uri;
};

export const ensureOfflineAudio = async (path: string) => {
  const url = await getSignedUrl(path);
  const fileName = path.split('/').pop() ?? 'audio.mp3';
  return downloadAudio(url, fileName);
};
