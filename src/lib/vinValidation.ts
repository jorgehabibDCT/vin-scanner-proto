import {
  VIN_CHAR_PATTERN,
  VIN_LENGTH,
  type VinScanResult,
} from "../types/vin";

const TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
};

const POSITION_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function normalizeVinInput(input: string): string {
  return input
    .toUpperCase()
    .replace(/[\s\-_./\\|]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

export function hasValidVinCharacters(vin: string): boolean {
  if (vin.length === 0) return false;
  if (/[IOQ]/i.test(vin)) return false;
  return VIN_CHAR_PATTERN.test(vin);
}

export function transliterateVinChar(char: string): number | null {
  if (/[0-9]/.test(char)) return Number(char);
  return TRANSLITERATION[char] ?? null;
}

export function computeExpectedCheckDigit(vin: string): string | null {
  if (vin.length !== VIN_LENGTH || !hasValidVinCharacters(vin)) return null;

  let sum = 0;
  for (let i = 0; i < VIN_LENGTH; i++) {
    const value = transliterateVinChar(vin[i]);
    if (value === null) return null;
    sum += value * POSITION_WEIGHTS[i];
  }

  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

export function validateVinChecksum(vin: string): boolean | null {
  if (vin.length !== VIN_LENGTH || !hasValidVinCharacters(vin)) return null;
  const expected = computeExpectedCheckDigit(vin);
  if (expected === null) return null;
  return vin[8] === expected;
}

export function buildVinScanResult(
  rawText: string,
  candidate: string | null,
  source: VinScanResult["source"],
  confidence?: number,
): VinScanResult {
  const normalizedVin = candidate;
  const isValidLength = normalizedVin?.length === VIN_LENGTH;
  const hasValidCharacters = normalizedVin
    ? hasValidVinCharacters(normalizedVin)
    : false;
  const checksumValid =
    normalizedVin && isValidLength && hasValidCharacters
      ? validateVinChecksum(normalizedVin)
      : null;

  return {
    rawText,
    normalizedVin,
    isValidLength: Boolean(isValidLength),
    hasValidCharacters,
    checksumValid,
    confidence,
    source,
  };
}

export function isFullyValidVin(result: VinScanResult): boolean {
  return (
    result.isValidLength &&
    result.hasValidCharacters &&
    result.checksumValid === true
  );
}
