// crypto.randomUUID is only available in secure contexts (https / localhost),
// so it throws when the app is served over plain http on a LAN IP. This wrapper
// uses it when present and falls back to a good-enough random id otherwise.
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
