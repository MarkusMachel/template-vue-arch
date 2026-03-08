import { MVTLayer } from "@deck.gl/geo-layers";

export type BoundaryType = "states" | "counties" | "zips";

const BOUNDARY_COLORS: Record<BoundaryType, [number, number, number, number]> =
  {
    states: [255, 200, 50, 230], // amber
    counties: [100, 180, 255, 200], // sky blue
    zips: [120, 255, 160, 170], // mint green
  };

const BOUNDARY_LINE_WIDTHS: Record<BoundaryType, number> = {
  states: 3,
  counties: 2,
  zips: 1.5,
};

const BOUNDARY_ZOOM_RANGES: Record<BoundaryType, [number, number]> = {
  states: [2, 20],
  counties: [5, 20],
  zips: [8, 20],
};

export function createBoundaryLayer(
  type: BoundaryType,
  zoom: number,
  visible: boolean,
  onClick?: (feature: any) => void,
) {
  const [minZoom, maxZoom] = BOUNDARY_ZOOM_RANGES[type];
  const inRange = zoom >= minZoom && zoom <= maxZoom;
  const opacity = visible && inRange ? 1 : 0;

  return new MVTLayer({
    id: `boundary-${type}`,
    data: `${import.meta.env.VITE_API_URL}/tiles/${type}/{z}/{x}/{y}`,
    opacity,
    filled: false,
    stroked: true,
    getLineColor: BOUNDARY_COLORS[type],
    getLineWidth: BOUNDARY_LINE_WIDTHS[type],
    lineWidthUnits: "pixels",
    lineWidthMinPixels: BOUNDARY_LINE_WIDTHS[type],
    pickable: true,
    onClick: (info: any) => {
      if (info.object) onClick?.(info.object);
    },
  });
}
