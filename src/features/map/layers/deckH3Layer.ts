import { H3HexagonLayer } from "@deck.gl/geo-layers";
import { generateMockH3Data } from "../utils/mockH3Data";
import type { H3Cell } from "../utils/mockH3Data";

const MIN_COLOR: [number, number, number, number] = [0, 128, 255, 80];
const MAX_COLOR: [number, number, number, number] = [255, 0, 128, 220];

function interpolateColor(
  min: [number, number, number, number],
  max: [number, number, number, number],
  t: number,
): [number, number, number, number] {
  return [
    Math.round(min[0] + (max[0] - min[0]) * t),
    Math.round(min[1] + (max[1] - min[1]) * t),
    Math.round(min[2] + (max[2] - min[2]) * t),
    Math.round(min[3] + (max[3] - min[3]) * t),
  ];
}

export function createH3Layer(resolution: number = 3, opacity: number = 1) {
  const data = generateMockH3Data(resolution);
  const maxCount = Math.max(...data.map((d) => d.count));

  return new H3HexagonLayer<H3Cell>({
    id: "vin-h3-hexagons",
    data,
    opacity,
    getHexagon: (d) => d.h3Index,
    getFillColor: (d) => {
      const t = maxCount > 1 ? d.count / maxCount : 0;
      return interpolateColor(MIN_COLOR, MAX_COLOR, t);
    },
    getElevation: 0,
    extruded: false,
    filled: true,
    stroked: true,
    getLineColor: [255, 255, 255, 40],
    lineWidthMinPixels: 1,
    pickable: true,
    onClick: (info) => {
      if (info.object) console.log("H3 cell clicked:", info.object);
    },
  });
}
