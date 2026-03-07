import { latLngToCell } from "h3-js";
import { MOCK_VIN_POINTS } from "./mockPoints";

export interface H3Cell {
  h3Index: string;
  count: number;
}

export function generateMockH3Data(resolution: number): H3Cell[] {
  const counts = new Map<string, number>();

  for (const point of MOCK_VIN_POINTS) {
    const h3Index = latLngToCell(point.lat, point.lon, resolution);
    counts.set(h3Index, (counts.get(h3Index) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([h3Index, count]) => ({
    h3Index,
    count,
  }));
}
