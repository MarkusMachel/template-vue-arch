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
  fuelType?: string;
  recallFlag?: boolean;
}

export const COLOR_MODES = {
  make: "make",
  fuelType: "fuelType",
  recallFlag: "recallFlag",
} as const;

export type ColorMode = keyof typeof COLOR_MODES;

export type ColorScheme = "blue-red" | "green-yellow" | "purple-orange";

export interface PointCard {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  city: string;
  state: string;
  zip: string;
  carrier_route: string;
  lat: number;
  lon: number;
  screenX: number;
  screenY: number;
  pinned: boolean;
}
