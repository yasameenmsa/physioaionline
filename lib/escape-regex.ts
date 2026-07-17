/**
 * Escapes special regex characters in a string so it can be safely
 * used in a MongoDB $regex query without causing ReDoS.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
