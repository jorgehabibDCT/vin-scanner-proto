import { useState } from "react";
import {
  associateVehicleWithDevice,
  searchVehicleByVin,
} from "../api/pegasusClient";

type PegasusPlaceholderCardProps = {
  confirmedVin: string | null;
};

export function PegasusPlaceholderCard({
  confirmedVin,
}: PegasusPlaceholderCardProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    if (!confirmedVin) {
      setMessage("Confirm a valid VIN first.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await searchVehicleByVin(confirmedVin);
      setMessage(
        result.found
          ? `Found vehicle ${result.vehicle?.id}`
          : "Placeholder: no Pegasus lookup performed (not configured).",
      );
    } finally {
      setLoading(false);
    }
  };

  const runAssociate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await associateVehicleWithDevice(
        "vehicle-id-placeholder",
        "imei-placeholder",
      );
      setMessage(result.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card pegasus-card">
      <h2>Next production step</h2>
      <p className="muted">
        Pegasus integration stubs only — no API calls or writes.
      </p>
      <ul className="pegasus-list">
        <li>Search Pegasus vehicle by VIN</li>
        <li>Read IMEI custom property</li>
        <li>PUT vehicle update to associate device</li>
      </ul>
      <div className="button-row">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={loading || !confirmedVin}
          onClick={runSearch}
        >
          Search Pegasus vehicle by VIN
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={loading}
          onClick={runAssociate}
        >
          Associate device (placeholder)
        </button>
      </div>
      {message && <p className="info-text">{message}</p>}
    </section>
  );
}
