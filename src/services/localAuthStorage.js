import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from 'js-sha256';

const USERS_KEY = '@eden-app/local-users';
const SESSION_KEY = '@eden-app/current-user-id';

const normalizeEmail = (email) => email.trim().toLowerCase();

const parseUsers = (raw) => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse local users list.', error);
    return [];
  }
};

const serializeUsers = (users) => JSON.stringify(users ?? []);

const extractBirthTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const loadUsers = async () => {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return parseUsers(raw);
  } catch (error) {
    console.warn('Unable to load local users.', error);
    return [];
  }
};

const persistUsers = async (users) => {
  try {
    await AsyncStorage.setItem(USERS_KEY, serializeUsers(users));
  } catch (error) {
    console.warn('Unable to persist local users.', error);
  }
};

const hashPassword = (password) => sha256(password ?? '');

export const createLocalUser = async ({
  email,
  password,
  fullName,
  phone,
  birthDate,
  plan,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const users = await loadUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    const error = new Error('E-mail já cadastrado.');
    error.code = 'local/email-exists';
    throw error;
  }

  const newUser = {
    id: `local-${Date.now()}`,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    fullName: fullName?.trim() ?? '',
    phone: phone?.trim() ?? '',
    birthDate: birthDate ? new Date(birthDate).toISOString() : null,
    birthTime: extractBirthTime(birthDate),
    plan: plan ?? 'gratuito',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await persistUsers(users);
  await AsyncStorage.setItem(SESSION_KEY, newUser.id);

  return newUser;
};

export const signInLocalUser = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const users = await loadUsers();
  const user = users.find((candidate) => candidate.email === normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password)) {
    const error = new Error('Credenciais inválidas.');
    error.code = 'local/invalid-credentials';
    throw error;
  }

  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return user;
};

export const getLocalCurrentUser = async () => {
  try {
    const userId = await AsyncStorage.getItem(SESSION_KEY);
    if (!userId) {
      return null;
    }

    const users = await loadUsers();
    return users.find((user) => user.id === userId) ?? null;
  } catch (error) {
    console.warn('Unable to read local session user.', error);
    return null;
  }
};

export const updateLocalCurrentUser = async (updates) => {
  const users = await loadUsers();
  const currentUser = await getLocalCurrentUser();

  if (!currentUser) {
    const error = new Error('Nenhum usuário local autenticado.');
    error.code = 'local/no-user';
    throw error;
  }

  const index = users.findIndex((user) => user.id === currentUser.id);
  if (index === -1) {
    const error = new Error('Usuário local não encontrado.');
    error.code = 'local/no-user';
    throw error;
  }

  const normalizedUpdates = {
    ...updates,
  };

  if (normalizedUpdates.birthDate instanceof Date) {
    normalizedUpdates.birthDate = normalizedUpdates.birthDate.toISOString();
  }

  const updatedUser = {
    ...users[index],
    ...normalizedUpdates,
  };

  users[index] = updatedUser;
  await persistUsers(users);
  return updatedUser;
};

export const sendLocalPasswordReset = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const users = await loadUsers();
  const userIndex = users.findIndex((candidate) => candidate.email === normalizedEmail);

  if (userIndex === -1) {
    const error = new Error('Não encontramos uma conta com esse e-mail.');
    error.code = 'local/user-not-found';
    throw error;
  }

  const temporaryPassword = Math.random().toString(36).slice(-10);
  users[userIndex].passwordHash = hashPassword(temporaryPassword);
  await persistUsers(users);

  return { temporaryPassword };
};

export const signOutLocalUser = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn('Unable to clear local session.', error);
  }
};

export const resetLocalState = async () => {
  await AsyncStorage.multiRemove([USERS_KEY, SESSION_KEY]);
};

