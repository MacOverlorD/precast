// Function to normalize crane ID to standard format (TC1, TC2, etc.)
export const normalizeCraneId = (craneId: string): string => {
  if (!craneId) return "";
  const normalized = craneId.trim().toUpperCase();
  // Convert "CRANE 1" -> "TC1", "TC1" -> "TC1", etc.
  const match = normalized.match(/(?:CRANE\s*|TC\s*)(\d+)/);
  if (match) {
    return `TC${match[1]}`;
  }
  // If already in correct format, return as is
  if (normalized.startsWith('TC') && /^\d+$/.test(normalized.substring(2))) {
    return normalized;
  }
  return normalized;
};