// utils/helpers.ts
export function isLegacyHexToken(t: string) {
  return /^[a-f0-9]{64}$/i.test(t);
}
