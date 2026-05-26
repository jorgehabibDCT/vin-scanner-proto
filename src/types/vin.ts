export type VinScanResult = {
  rawText: string;
  normalizedVin: string | null;
  isValidLength: boolean;
  hasValidCharacters: boolean;
  checksumValid: boolean | null;
  confidence?: number;
  source: "ocr" | "manual" | "mock";
};

export type VinScanStatus =
  | "idle"
  | "scanning"
  | "possible"
  | "valid"
  | "invalid_checksum"
  | "no_vin"
  | "invalid";

export const VIN_LENGTH = 17;

/** Allowed in a VIN (excludes I, O, Q per ISO 3779). */
export const VIN_CHAR_PATTERN = /^[A-HJ-NPR-Z0-9]+$/;
