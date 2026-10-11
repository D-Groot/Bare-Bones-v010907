/** Collision-resistant client-side id, e.g. `exp-lq3x9k-a8f2c1`. */
export function makeId(prefix: string): string {
  const time = Date.now().toString(36);
  const rand =
    typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join('')
      : Math.random().toString(16).slice(2, 10);
  return `${prefix}-${time}-${rand}`;
}
