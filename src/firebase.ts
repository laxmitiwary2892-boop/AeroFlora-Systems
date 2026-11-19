import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { UserProfileDoc, UserRole } from './types/aeroflora';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration — Firestore client appears offline.');
    }
  }
}

testConnection();

export async function fetchUserProfile(uid: string): Promise<UserProfileDoc | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfileDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export interface SaveUserProfileInput {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  organization: string;
  state: string;
  district: string;
  authProvider: 'google' | 'password';
  emailVerified: boolean;
}

export async function syncUserProfileToFirestore(
  input: SaveUserProfileInput
): Promise<UserProfileDoc> {
  const path = `users/${input.uid}`;
  const ref = doc(db, 'users', input.uid);

  const safePayload = {
    uid: input.uid.slice(0, 128),
    fullName: (input.fullName || 'AeroFlora User').trim().slice(0, 120),
    email: input.email.trim().slice(0, 254),
    role: input.role,
    organization: (input.organization || 'Independent Farm Holding').trim().slice(0, 160),
    state: (input.state || 'Gujarat').trim().slice(0, 80),
    district: (input.district || 'Banaskantha').trim().slice(0, 80),
    authProvider: input.authProvider,
    emailVerified: Boolean(input.emailVerified),
  };

  try {
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...safePayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = existingSnap.data() as Partial<UserProfileDoc>;
      await setDoc(
        ref,
        {
          ...safePayload,
          authProvider: existingData.authProvider || safePayload.authProvider,
          createdAt: existingData.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    const updatedSnap = await getDoc(ref);
    return (updatedSnap.data() || safePayload) as UserProfileDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
