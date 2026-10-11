import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { BudgetAction } from '../state/budgetReducer';
import type { FinancialState } from '../types/finance';
import { normalizeState } from '../state/normalizeState';
import { INITIAL_FINANCIAL_STATE } from '../utils/storage';

export interface CloudUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

type FirebaseModule = typeof import('../utils/firebase');
type SyncModule = typeof import('../utils/firebaseSync');

/**
 * Firebase is ~550 kB, so it is loaded after first paint (on idle) instead of at startup.
 * Local edits are pushed to Firestore; remote snapshots are applied to local state.
 * A snapshot identical to local state is ignored, which prevents the save -> snapshot -> save loop.
 */
export function useCloudSync(state: FinancialState, dispatch: Dispatch<BudgetAction>) {
  const [user, setUser] = useState<CloudUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fb = useRef<FirebaseModule | null>(null);
  const sync = useRef<SyncModule | null>(null);
  const stateRef = useRef(state);
  const lastRemoteJson = useRef<string | null>(null);
  stateRef.current = state;

  const load = useCallback(async () => {
    if (!fb.current || !sync.current) {
      const [f, s] = await Promise.all([import('../utils/firebase'), import('../utils/firebaseSync')]);
      fb.current = f;
      sync.current = s;
    }
    return { fb: fb.current, sync: sync.current };
  }, []);

  // Boot Firebase on idle and watch auth state.
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    const boot = async () => {
      const { fb: f } = await load();
      if (cancelled) return;
      void f.testConnection();
      const { onAuthStateChanged } = await import('firebase/auth');
      unsub = onAuthStateChanged(f.auth, (u) =>
        setUser(
          u ? { uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL } : null
        )
      );
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    const handle = idle ? idle(() => void boot()) : window.setTimeout(() => void boot(), 1500);
    return () => {
      cancelled = true;
      if (!idle) window.clearTimeout(handle);
      unsub?.();
    };
  }, [load]);

  // Apply remote changes.
  useEffect(() => {
    if (!user || !sync.current) return;
    return sync.current.subscribeToUserBudget(user.uid, (remote) => {
      const normalized = normalizeState(remote, INITIAL_FINANCIAL_STATE);
      if (!normalized) return;
      // The webhook never leaves the device, so keep the local one.
      const next = { ...normalized, discordWebhookUrl: stateRef.current.discordWebhookUrl };
      const json = JSON.stringify(next);
      if (json === JSON.stringify(stateRef.current)) return;
      lastRemoteJson.current = json;
      dispatch({ type: 'replace', state: next });
    });
  }, [user, dispatch]);

  // Push local changes.
  useEffect(() => {
    if (!user || !sync.current) return;
    if (JSON.stringify(state) === lastRemoteJson.current) return;
    let live = true;
    setIsSyncing(true);
    sync.current
      .saveUserBudgetToFirestore(user.uid, state)
      .catch(() => undefined)
      .finally(() => live && setIsSyncing(false));
    return () => {
      live = false;
    };
  }, [state, user]);

  const login = useCallback(async () => {
    const { fb: f } = await load();
    await f.loginWithGoogle();
  }, [load]);

  const logout = useCallback(async () => {
    const { fb: f } = await load();
    await f.logoutUser();
  }, [load]);

  return { user, isSyncing, login, logout };
}
