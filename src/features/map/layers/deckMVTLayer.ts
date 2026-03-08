import { MVTLayer } from "@deck.gl/geo-layers";
import type { ColorMode } from "../types/map.types";

export type PointShape = "circle" | "diamond" | "triangle";

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

const ICON_ATLAS = generateIconAtlas();
const ICON_MAPPING = {
  circle: { x: 0, y: 0, width: 64, height: 64, mask: true },
  diamond: { x: 64, y: 0, width: 64, height: 64, mask: true },
  triangle: { x: 128, y: 0, width: 64, height: 64, mask: true },
};

function generateIconAtlas(): string {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size * 3;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "white";

  // Circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fill();

  // Diamond
  ctx.beginPath();
  ctx.moveTo(size + size / 2, 4);
  ctx.lineTo(size * 2 - 4, size / 2);
  ctx.lineTo(size + size / 2, size - 4);
  ctx.lineTo(size + 4, size / 2);
  ctx.closePath();
  ctx.fill();

  // Triangle
  ctx.beginPath();
  ctx.moveTo(size * 2 + size / 2, 4);
  ctx.lineTo(size * 3 - 4, size - 4);
  ctx.lineTo(size * 2 + 4, size - 4);
  ctx.closePath();
  ctx.fill();

  return canvas.toDataURL();
}

export function createMVTPointLayer(
  opacity: number = 0.9,
  colorMode: ColorMode = "make",
  pointShape: PointShape = "circle",
  tileUrl: string = `${import.meta.env.VITE_API_URL}/tiles/{z}/{x}/{y}`,
  onClick?: (feature: any, screenX: number, screenY: number) => void,
) {
  const getColor = (f: any): [number, number, number] => {
    if (colorMode === "make") {
      return MAKE_COLORS[f.properties.make] ?? DEFAULT_COLOR;
    }
    return DEFAULT_COLOR;
  };

  const handleClick = (info: any) => {
    if (info.object && info.pixel) {
      onClick?.(info.object, info.pixel[0], info.pixel[1]);
    }
  };

  if (pointShape === "circle") {
    return new MVTLayer({
      id: "vin-mvt-points",
      data: tileUrl,
      opacity,
      pointRadiusMinPixels: 4,
      pointRadiusMaxPixels: 12,
      getPointRadius: 50,
      getFillColor: (f: any) => getColor(f),
      pickable: true,
      onClick: handleClick,
    });
  }

  return new MVTLayer({
    id: "vin-mvt-points",
    data: tileUrl,
    opacity,
    pointType: "icon",
    iconAtlas: ICON_ATLAS,
    iconMapping: ICON_MAPPING,
    getIcon: () => pointShape,
    getIconSize: 20,
    getIconColor: (f: any) => getColor(f),
    iconSizeUnits: "pixels",
    iconSizeMinPixels: 6,
    iconSizeMaxPixels: 20,
    pickable: true,
    onClick: handleClick,
  });
}
