import { VIN_LENGTH } from "../types/vin";
import {
  hasValidVinCharacters,
  normalizeVinInput,
  validateVinChecksum,
} from "./vinValidation";

export type VinCandidate = {
  vin: string;
  checksumValid: boolean | null;
  score: number;
};

function scoreCandidate(vin: string): number {
  let score = 0;
  if (vin.length === VIN_LENGTH) score += 10;
  if (hasValidVinCharacters(vin)) score += 20;
  const checksum = validateVinChecksum(vin);
  if (checksum === true) score += 50;
  else if (checksum === false) score += 5;
  return score;
}

function collectWindowCandidates(normalized: string): VinCandidate[] {
  const candidates: VinCandidate[] = [];
  const seen = new Set<string>();

  for (let i = 0; i <= normalized.length - VIN_LENGTH; i++) {
    const slice = normalized.slice(i, i + VIN_LENGTH);
    if (seen.has(slice)) continue;
    seen.add(slice);
    candidates.push({
      vin: slice,
      checksumValid: validateVinChecksum(slice),
      score: scoreCandidate(slice),
    });
  }

  return candidates;
}

/** Loose match: alphanumeric runs that may contain invalid chars we can strip. */
function collectStrictSubsequenceCandidates(raw: string): VinCandidate[] {
  const upper = raw.toUpperCase();
  const candidates: VinCandidate[] = [];
  const seen = new Set<string>();

  const tokens = upper.split(/[^A-Z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    const normalized = normalizeVinInput(token);
    if (normalized.length < VIN_LENGTH) continue;

    for (const c of collectWindowCandidates(normalized)) {
      if (!seen.has(c.vin)) {
        seen.add(c.vin);
        candidates.push(c);
      }
    }
  }

  return candidates;
}

export function extractVinCandidates(rawText: string): VinCandidate[] {
  const normalized = normalizeVinInput(rawText);
  const fromNormalized =
    normalized.length >= VIN_LENGTH ? collectWindowCandidates(normalized) : [];
  const fromTokens = collectStrictSubsequenceCandidates(rawText);

  const merged = new Map<string, VinCandidate>();
  for (const c of [...fromNormalized, ...fromTokens]) {
    const existing = merged.get(c.vin);
    if (!existing || c.score > existing.score) merged.set(c.vin, c);
  }

  return [...merged.values()].sort((a, b) => b.score - a.score);
}

export function extractBestVin(rawText: string): string | null {
  const candidates = extractVinCandidates(rawText);
  const valid = candidates.filter((c) => hasValidVinCharacters(c.vin));
  if (valid.length === 0) return null;
  return valid[0].vin;
}
