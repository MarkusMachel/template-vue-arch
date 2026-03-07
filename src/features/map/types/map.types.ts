export interface MapConfig {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
  style: string;
}

export interface VinPoint {
  vin: string;
  lat: number;
  lon: number;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  recallFlag: boolean;
}

export const COLOR_MODES = {
  make: "make",
  fuelType: "fuelType",
  recallFlag: "recallFlag",
} as const;

export type ColorMode = keyof typeof COLOR_MODES;
