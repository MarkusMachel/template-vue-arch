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
