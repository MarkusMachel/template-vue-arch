import type { PickingInfo } from "@deck.gl/core";
import type { VinPoint, ColorMode } from "../types/map.types";
import { ScatterplotLayer } from "@deck.gl/layers";

const MAKE_COLORS: Record<string, [number, number, number]> = {
  Chevrolet: [231, 76, 60],
  Honda: [52, 152, 219],
  Toyota: [46, 204, 113],
  Ford: [230, 126, 34],
  Volkswagen: [155, 89, 182],
  Nissan: [26, 188, 156],
  Tesla: [233, 30, 99],
};

const FUEL_COLORS: Record<string, [number, number, number]> = {
  gas: [230, 126, 34],
  electric: [46, 204, 113],
  hybrid: [52, 152, 219],
};

const RECALL_COLORS: Record<string, [number, number, number]> = {
  true: [231, 76, 60],
  false: [149, 165, 166],
};

const DEFAULT_COLOR: [number, number, number] = [170, 170, 170];

function getColor(
  point: VinPoint,
  colorMode: ColorMode,
): [number, number, number] {
  switch (colorMode) {
    case "make":
      return MAKE_COLORS[point.make] ?? DEFAULT_COLOR;
    case "fuelType":
      return FUEL_COLORS[point.fuelType ?? ""] ?? DEFAULT_COLOR;
    case "recallFlag":
      return RECALL_COLORS[String(point.recallFlag)] ?? DEFAULT_COLOR;
  }
}

export function createVinScatterplotLayer(
  data: VinPoint[],
  onClick?: (vin: VinPoint) => void,
  onHoverCallback?: (vin: VinPoint | null) => void,
  opacity: number = 0.9,
  colorMode: ColorMode = "make",
  pointSize: number = 30000,
) {
  return new ScatterplotLayer<VinPoint>({
    id: "vin-scatterplot",
    data,
    getPosition: (d) => [d.lon, d.lat],
    getFillColor: (d) => getColor(d, colorMode),
    getRadius: pointSize,
    radiusMinPixels: 5,
    radiusMaxPixels: 15,
    pickable: true,
    opacity,
    onClick: (info: PickingInfo<VinPoint>) => {
      if (info.object) onClick?.(info.object);
    },
    onHover: (info: PickingInfo<VinPoint>) => {
      onHoverCallback?.(info.object ?? null);
    },
  });
}
