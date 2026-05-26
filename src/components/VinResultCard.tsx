import type { VinScanResult, VinScanStatus } from "../types/vin";
import { isFullyValidVin } from "../lib/vinValidation";

type VinResultCardProps = {
  status: VinScanStatus;
  statusLabel: string;
  scanResult: VinScanResult | null;
  manualVin: string;
  onManualVinChange: (value: string) => void;
  onConfirm: () => void;
};

function CheckItem({
  label,
  passed,
  unknown,
}: {
  label: string;
  passed: boolean;
  unknown?: boolean;
}) {
  let icon = "✗";
  let className = "check-fail";
  if (unknown) {
    icon = "—";
    className = "check-unknown";
  } else if (passed) {
    icon = "✓";
    className = "check-pass";
  }

  return (
    <li className={className}>
      <span aria-hidden>{icon}</span> {label}
    </li>
  );
}

export function VinResultCard({
  status,
  statusLabel,
  scanResult,
  manualVin,
  onManualVinChange,
  onConfirm,
}: VinResultCardProps) {
  const displayVin =
    manualVin || scanResult?.normalizedVin || scanResult?.rawText || "—";

  const isValid = scanResult ? isFullyValidVin(scanResult) : false;

  return (
    <section className="card vin-card">
      <h2>Detected VIN</h2>
      <p className={`status-banner status-${status}`} role="status">
        {statusLabel}
      </p>

      <p className="vin-display" aria-live="polite">
        {displayVin}
      </p>

      {scanResult?.rawText && scanResult.source === "ocr" && (
        <details className="raw-ocr">
          <summary>Raw OCR text</summary>
          <pre>{scanResult.rawText.trim() || "(empty)"}</pre>
        </details>
      )}

      <h3>Validation</h3>
      <ul className="checklist">
        <CheckItem
          label="17 characters"
          passed={scanResult?.isValidLength ?? false}
          unknown={!scanResult}
        />
        <CheckItem
          label="Valid VIN characters (no I, O, Q)"
          passed={scanResult?.hasValidCharacters ?? false}
          unknown={!scanResult}
        />
        <CheckItem
          label="Checksum passed"
          passed={scanResult?.checksumValid === true}
          unknown={
            !scanResult ||
            scanResult.checksumValid === null ||
            !scanResult.isValidLength
          }
        />
      </ul>

      {scanResult?.checksumValid === false && (
        <p className="error-text">Invalid checksum — verify the 9th character.</p>
      )}

      {scanResult && !isValid && scanResult.normalizedVin && (
        <p className="warn-text">Invalid VIN — edit below or scan again.</p>
      )}

      <label className="field-label" htmlFor="manual-vin">
        Manual VIN
      </label>
      <input
        id="manual-vin"
        className="vin-input"
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        maxLength={24}
        placeholder="Enter 17-character VIN"
        value={manualVin}
        onChange={(e) => onManualVinChange(e.target.value)}
      />

      <button type="button" className="btn btn-primary btn-block" onClick={onConfirm}>
        Confirm VIN
      </button>
    </section>
  );
}
