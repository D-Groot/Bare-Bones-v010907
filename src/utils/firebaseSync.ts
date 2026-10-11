import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { FinancialState } from '../types/finance';

export async function loadUserBudgetFromFirestore(userId: string): Promise<FinancialState | null> {
  const docPath = `users/${userId}/budget/state`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'budget', 'state'));
    if (snap.exists()) {
      return snap.data() as FinancialState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export async function saveUserBudgetToFirestore(
  userId: string,
  state: FinancialState
): Promise<void> {
  const docPath = `users/${userId}/budget/state`;
  try {
    // The Discord webhook is a secret: it stays on this device and is never uploaded.
    const { discordWebhookUrl: _omitted, ...syncable } = state;
    const payload = {
      ...syncable,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'budget', 'state'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export function subscribeToUserBudget(
  userId: string,
  onUpdate: (state: FinancialState) => void
): () => void {
  const docPath = `users/${userId}/budget/state`;
  const unsub = onSnapshot(
    doc(db, 'users', userId, 'budget', 'state'),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as FinancialState);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  );
  return unsub;
}
