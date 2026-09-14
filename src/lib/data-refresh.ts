/**
 * Lightweight global data synchronization via browser CustomEvent.
 * No external dependency, no financial state in localStorage.
 * Database tetap source of truth — event hanya trigger refetch.
 */

export const FINAI_REFRESH_EVENT = 'finai:refresh';

export type FinaiRefreshKind =
  | 'wallet'
  | 'transaction'
  | 'transfer'
  | 'goal'
  | 'goal_contribution'
  | 'budget'
  | 'settings'
  | 'profile'
  | 'all';

export function emitRefresh(kind: FinaiRefreshKind = 'all'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FINAI_REFRESH_EVENT, { detail: { kind } }));
}

export function onRefresh(callback: (kind: FinaiRefreshKind) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { kind?: FinaiRefreshKind } | undefined;
    callback(detail?.kind || 'all');
  };
  window.addEventListener(FINAI_REFRESH_EVENT, handler as EventListener);
  return () => window.removeEventListener(FINAI_REFRESH_EVENT, handler as EventListener);
}
