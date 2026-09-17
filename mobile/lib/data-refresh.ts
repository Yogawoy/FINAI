/**
 * FinAI Mobile Data Synchronization Event Emitter
 * 
 * Lightweight event system for triggering refetches across tabs/screens
 * without managing financial state in local storage.
 * Backend database is ALWAYS the single source of truth.
 */

export type FinaiRefreshKind =
  | 'wallet'
  | 'transaction'
  | 'transfer'
  | 'goal'
  | 'budget'
  | 'all';

type RefreshListener = (kind: FinaiRefreshKind) => void;

const listeners = new Set<RefreshListener>();

export function emitRefresh(kind: FinaiRefreshKind = 'all'): void {
  listeners.forEach((listener) => {
    try {
      listener(kind);
    } catch (err) {
      console.warn('Error in refresh listener:', err);
    }
  });
}

export function onRefresh(callback: (kind: FinaiRefreshKind) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
