import type { PickingInfo } from "@deck.gl/core";
import type { VinPoint } from "../types/map.types";
import { MOCK_VIN_POINTS } from "../utils/mockPoints";
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

const DEFAULT_COLOR: [number, number, number] = [170, 170, 170];

export function createVinScatterplotLayer(
  onClick?: (vin: VinPoint) => void,
  onHoverCallback?: (vin: VinPoint | null) => void,
  opacity: number = 0.9,
) {
  return new ScatterplotLayer<VinPoint>({
    id: "vin-scatterplot",
    data: MOCK_VIN_POINTS,
    getPosition: (d) => [d.lon, d.lat],
    getFillColor: (d) => MAKE_COLORS[d.make] ?? DEFAULT_COLOR,
    getRadius: 30000,
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
