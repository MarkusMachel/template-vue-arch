import type { VinPoint } from "../types/map.types";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchVins(): Promise<VinPoint[]> {
  const res = await fetch(`${BASE_URL}/api/vins`);
  if (!res.ok) throw new Error("Failed to fetch VINs");
  const data = await res.json();
  return data.map((v: any) => ({
    vin: v.vin,
    make: v.make,
    model: v.model,
    year: v.year,
    lat: v.lat,
    lon: v.lon,
    fuelType: "unknown",
    recallFlag: false,
  }));
}
