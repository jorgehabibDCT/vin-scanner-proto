import { useCallback, useMemo, useState } from "react";
import { CameraScanner } from "./components/CameraScanner";
import { PegasusPlaceholderCard } from "./components/PegasusPlaceholderCard";
import { VinResultCard } from "./components/VinResultCard";
import {
  buildVinScanResult,
  isFullyValidVin,
  normalizeVinInput,
} from "./lib/vinValidation";
import type { VinScanResult, VinScanStatus } from "./types/vin";
import "./App.css";

function deriveStatus(
  scanning: boolean,
  result: VinScanResult | null,
): { status: VinScanStatus; label: string } {
  if (scanning) return { status: "scanning", label: "Scanning…" };
  if (!result?.normalizedVin) {
    if (result?.rawText) return { status: "no_vin", label: "No VIN detected" };
    return { status: "idle", label: "Ready to scan" };
  }
  if (isFullyValidVin(result)) {
    return { status: "valid", label: "Valid VIN" };
  }
  if (result.checksumValid === false) {
    return { status: "invalid_checksum", label: "Invalid checksum" };
  }
  if (result.isValidLength && result.hasValidCharacters) {
    return { status: "invalid", label: "Invalid VIN" };
  }
  return { status: "possible", label: "Possible VIN found" };
}

function App() {
  const [scanResult, setScanResult] = useState<VinScanResult | null>(null);
  const [manualVin, setManualVin] = useState("");
  const [confirmedVin, setConfirmedVin] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const { status, label } = useMemo(
    () => deriveStatus(scanning, scanResult),
    [scanning, scanResult],
  );

  const handleScanResult = useCallback((result: VinScanResult) => {
    setScanResult(result);
    if (result.normalizedVin) setManualVin(result.normalizedVin);
  }, []);

  const handleConfirm = () => {
    setError("");
    const normalized = normalizeVinInput(manualVin);
    if (!normalized) {
      setError("Enter a VIN to confirm.");
      return;
    }
    const result = buildVinScanResult(manualVin, normalized, "manual");
    setScanResult(result);

    if (!isFullyValidVin(result)) {
      if (result.checksumValid === false) {
        setError("Checksum failed — correct the VIN or rescan.");
      } else {
        setError("Invalid VIN — must be 17 valid characters.");
      }
      setConfirmedVin(null);
      return;
    }

    setConfirmedVin(normalized);
    setError("");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>VIN Scanner Prototype</h1>
        <p className="subtitle">PROD-221 — scan &amp; validate only</p>
      </header>

      {error && (
        <p className="banner-error" role="alert">
          {error}
        </p>
      )}

      {confirmedVin && (
        <p className="banner-success" role="status">
          Confirmed VIN: <strong>{confirmedVin}</strong>
        </p>
      )}

      <CameraScanner
        onScanResult={handleScanResult}
        onScanningChange={setScanning}
        onError={(msg) => msg && setError(msg)}
      />

      <VinResultCard
        status={status}
        statusLabel={label}
        scanResult={scanResult}
        manualVin={manualVin}
        onManualVinChange={setManualVin}
        onConfirm={handleConfirm}
      />

      <PegasusPlaceholderCard confirmedVin={confirmedVin} />

      <footer className="app-footer">
        <p className="muted">
          OCR: Tesseract.js · Validation: ISO 3779 checksum
        </p>
      </footer>
    </div>
  );
}

export default App;
