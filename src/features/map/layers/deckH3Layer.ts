import { H3HexagonLayer } from "@deck.gl/geo-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { cellToLatLng } from "h3-js";
import type { H3Cell } from "../utils/mockH3Data";
import type { ColorScheme } from "../types/map.types";

export type HexStyle = "hexagon" | "bubble";

const COLOR_SCHEMES: Record<
  ColorScheme,
  {
    min: [number, number, number, number];
    max: [number, number, number, number];
  }
> = {
  "blue-red": {
    min: [0, 128, 255, 80],
    max: [255, 0, 128, 220],
  },
  "green-yellow": {
    min: [0, 200, 100, 80],
    max: [255, 220, 0, 220],
  },
  "purple-orange": {
    min: [120, 0, 255, 80],
    max: [255, 140, 0, 220],
  },
};

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

export function createH3Layer(
  data: H3Cell[],
  resolution: number = 3,
  opacity: number = 1,
  colorScheme: ColorScheme = "blue-red",
  hexStyle: HexStyle = "hexagon",
) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const scheme = COLOR_SCHEMES[colorScheme];

  if (hexStyle === "bubble") {
    return new ScatterplotLayer<H3Cell>({
      id: "vin-h3-bubbles",
      data,
      opacity,
      getPosition: (d) => {
        const [lat, lng] = cellToLatLng(d.h3Index);
        return [lng, lat];
      },
      getRadius: (d) => {
        const t = d.count / maxCount;
        // scale radius between 20km and 120km based on density
        return 20000 + t * 100000;
      },
      getFillColor: (d) => {
        const t = d.count / maxCount;
        return interpolateColor(scheme.min, scheme.max, t);
      },
      stroked: true,
      getLineColor: [255, 255, 255, 40],
      lineWidthMinPixels: 1,
      pickable: true,
      radiusUnits: "meters",
      onClick: (info) => {
        if (info.object) console.log("bubble clicked:", info.object);
      },
    });
  }

  return new H3HexagonLayer<H3Cell>({
    id: "vin-h3-hexagons",
    data,
    opacity,
    getHexagon: (d) => d.h3Index,
    getFillColor: (d) => {
      const t = d.count / maxCount;
      return interpolateColor(scheme.min, scheme.max, t);
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
