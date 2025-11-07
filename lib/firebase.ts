const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

if (!FIREBASE_API_KEY) {
  console.warn(
    'EXPO_PUBLIC_FIREBASE_API_KEY is not defined. Firebase requests will fail until it is provided.'
  );
}

if (!FIREBASE_PROJECT_ID) {
  console.warn(
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID is not defined. Firestore requests will fail until it is provided.'
  );
}

interface SignUpResponse {
  idToken: string;
  localId: string;
  email: string;
}

interface FirebaseErrorResponse {
  error: {
    message: string;
  };
}

type FirestoreField =
  | { stringValue: string }
  | { timestampValue: string }
  | { booleanValue: boolean };

type FirestoreFields = Record<string, FirestoreField>;

function buildFirestoreFields(data: Record<string, string | null | boolean | undefined>): FirestoreFields {
  const fields: FirestoreFields = {};

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value) {
      // Date strings should already be passed as ISO strings.
      fields[key] = { stringValue: String(value) };
    }
  });

  return fields;
}

function mapFirebaseError(message: string): string {
  switch (message) {
    case 'EMAIL_EXISTS':
      return 'Este e-mail já está cadastrado.';
    case 'INVALID_EMAIL':
      return 'E-mail inválido. Verifique o formato informado.';
    case 'OPERATION_NOT_ALLOWED':
      return 'Cadastro desabilitado temporariamente. Tente novamente mais tarde.';
    case 'WEAK_PASSWORD : Password should be at least 6 characters':
    case 'WEAK_PASSWORD':
      return 'A senha deve possuir pelo menos 6 caracteres.';
    default:
      return 'Não foi possível criar sua conta no momento.';
  }
}

export async function signUpWithEmailAndPassword(
  email: string,
  password: string
): Promise<SignUpResponse> {
  if (!FIREBASE_API_KEY) {
    throw new Error('Configuração de Firebase ausente: defina EXPO_PUBLIC_FIREBASE_API_KEY.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  if (!response.ok) {
    let errorMessage = 'Erro desconhecido ao cadastrar usuário.';

    try {
      const errorData = (await response.json()) as FirebaseErrorResponse;
      errorMessage = mapFirebaseError(errorData.error.message);
    } catch (error) {
      console.error('Erro ao interpretar resposta do Firebase Auth', error);
    }

    throw new Error(errorMessage);
  }

  const data = (await response.json()) as SignUpResponse;
  return data;
}

interface SaveUserProfilePayload {
  idToken: string;
  uid: string;
  profile: {
    full_name: string;
    email: string;
    phone?: string;
    plan: string;
    birth_date?: string | null;
    birth_time?: string | null;
  };
}

export async function saveUserProfile({ idToken, uid, profile }: SaveUserProfilePayload): Promise<void> {
  if (!FIREBASE_PROJECT_ID) {
    throw new Error('Configuração de Firebase ausente: defina EXPO_PUBLIC_FIREBASE_PROJECT_ID.');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users?documentId=${uid}`;

  const fields = buildFirestoreFields({
    ...profile,
    created_at: new Date().toISOString(),
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    let errorDetails = 'Erro desconhecido ao salvar dados do usuário.';

    try {
      const errorData = await response.text();
      errorDetails = errorData;
    } catch (error) {
      console.error('Erro ao interpretar resposta do Firestore', error);
    }

    throw new Error(errorDetails);
  }
}
