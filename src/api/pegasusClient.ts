export type PegasusVehicle = {
  id: string;
  vin: string;
  name?: string;
  imeiCustomProperty?: string | null;
};

export type PegasusSearchResult = {
  found: boolean;
  vehicle: PegasusVehicle | null;
};

/**
 * Placeholder for Pegasus vehicle lookup by VIN.
 * TODO: VITE_PEGASUS_API_URL, VITE_PEGASUS_API_TOKEN from environment.
 */
export async function searchVehicleByVin(
  vin: string,
): Promise<PegasusSearchResult> {
  console.info("[pegasus placeholder] searchVehicleByVin", { vin });
  await delay(300);
  return {
    found: false,
    vehicle: null,
  };
}

/**
 * Placeholder for associating a GPS device IMEI with a Pegasus vehicle.
 * TODO: PUT /vehicles/:id with custom property for IMEI — no writes in prototype.
 */
export async function associateVehicleWithDevice(
  vehicleId: string,
  imei: string,
): Promise<{ success: boolean; message: string }> {
  console.info("[pegasus placeholder] associateVehicleWithDevice", {
    vehicleId,
    imei,
  });
  await delay(300);
  return {
    success: false,
    message:
      "Prototype only — Pegasus association is not implemented. Wire PUT when API credentials are available.",
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
