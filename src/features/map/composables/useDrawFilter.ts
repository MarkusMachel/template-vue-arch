import type { Map as MaplibreMap } from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import maplibregl from "maplibre-gl";
import { useMapStore } from "../store/mapStore";
import type { DrawMode } from "../store/mapStore";

const DRAW_STYLES = [
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"]],
    paint: { "fill-color": "#3b82f6", "fill-opacity": 0.15 },
  },
  {
    id: "gl-draw-polygon-stroke",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"]],
    paint: {
      "line-color": "#3b82f6",
      "line-width": 2,
      "line-dasharray": [4, 2],
    },
  },
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"]],
    paint: {
      "line-color": "#3b82f6",
      "line-width": 2,
      "line-dasharray": [4, 2],
    },
  },
  {
    id: "gl-draw-point-outer",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
    paint: { "circle-color": "#fff", "circle-radius": 5 },
  },
  {
    id: "gl-draw-point-inner",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: { "circle-color": "#3b82f6", "circle-radius": 3 },
  },
];

function circlePolygon(
  centerLng: number,
  centerLat: number,
  radiusKm: number,
  steps = 64,
): GeoJSON.Polygon {
  const coords: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = (radiusKm / 111.32) * Math.cos(angle);
    const dy =
      (radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180))) *
      Math.sin(angle);
    coords.push([centerLng + dy, centerLat + dx] as [number, number]);
  }
  const first = coords[0];
  if (first) coords.push(first);
  return { type: "Polygon", coordinates: [coords] };
}

function getRadiusKm(cx: number, cy: number, mx: number, my: number): number {
  const dx = (mx - cx) * 111.32 * Math.cos((cy * Math.PI) / 180);
  const dy = (my - cy) * 111.32;
  return Math.sqrt(dx * dx + dy * dy);
}

// Add live circle preview as a MapLibre source/layer
function initPreviewLayer(map: MaplibreMap) {
  map.addSource("filter-preview", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "filter-preview-fill",
    type: "fill",
    source: "filter-preview",
    paint: { "fill-color": "#3b82f6", "fill-opacity": 0.15 },
  });
  map.addLayer({
    id: "filter-preview-stroke",
    type: "line",
    source: "filter-preview",
    paint: {
      "line-color": "#3b82f6",
      "line-width": 2,
      "line-dasharray": [4, 2],
    },
  });
}

function updatePreview(map: MaplibreMap, geometry: GeoJSON.Geometry | null) {
  const source = map.getSource("filter-preview") as maplibregl.GeoJSONSource;
  if (!source) return;
  source.setData({
    type: "FeatureCollection",
    features: geometry ? [{ type: "Feature", properties: {}, geometry }] : [],
  });
}

export function useDrawFilter(map: MaplibreMap, onFilter: () => void) {
  const store = useMapStore();

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    styles: DRAW_STYLES,
  });

  map.addControl(draw as any);
  initPreviewLayer(map);

  let circleCenter: [number, number] | null = null;
  let rectangleStart: [number, number] | null = null;
  let isDrawingCircle = false;
  let isDrawingRectangle = false;

  function applyFilter(geometry: GeoJSON.Geometry) {
    store.setFilter(geometry);
    store.isFiltering = true;
    store.drawMode = null;
    map.getCanvas().style.cursor = "";
    isDrawingCircle = false;
    isDrawingRectangle = false;
    circleCenter = null;
    rectangleStart = null;
    // ← removed updatePreview(map, null) so shape stays visible
    onFilter();
  }

  // ── Mouse move — live preview ─────────────────────────────────────────────

  map.on("mousemove", (e) => {
    if (isDrawingCircle && circleCenter) {
      const radiusKm = getRadiusKm(
        circleCenter[0],
        circleCenter[1],
        e.lngLat.lng,
        e.lngLat.lat,
      );
      if (radiusKm > 0) {
        const geom = circlePolygon(circleCenter[0], circleCenter[1], radiusKm);
        updatePreview(map, geom);
        // Update live stats in store
        store.liveRadiusKm = radiusKm;
        store.liveAreaKm2 = Math.PI * radiusKm * radiusKm;
      }
    }

    if (isDrawingRectangle && rectangleStart) {
      const [x1, y1] = rectangleStart;
      const [x2, y2] = [e.lngLat.lng, e.lngLat.lat];
      const geom: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [
          [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2],
            [x1, y1],
          ],
        ],
      };
      updatePreview(map, geom);
      // Compute area approx
      const wKm =
        Math.abs(x2 - x1) *
        111.32 *
        Math.cos((((y1 + y2) / 2) * Math.PI) / 180);
      const hKm = Math.abs(y2 - y1) * 111.32;
      store.liveAreaKm2 = wKm * hKm;
      store.liveRadiusKm = null;
    }
  });

  // ── Click handler ─────────────────────────────────────────────────────────

  map.on("click", (e) => {
    if (store.drawMode === "circle") {
      if (!isDrawingCircle) {
        circleCenter = [e.lngLat.lng, e.lngLat.lat];
        isDrawingCircle = true;
        map.getCanvas().style.cursor = "crosshair";
      } else if (circleCenter) {
        const radiusKm = getRadiusKm(
          circleCenter[0],
          circleCenter[1],
          e.lngLat.lng,
          e.lngLat.lat,
        );
        const geometry = circlePolygon(
          circleCenter[0],
          circleCenter[1],
          radiusKm,
        );
        store.filterRadiusKm = radiusKm;
        store.filterAreaKm2 = Math.PI * radiusKm * radiusKm;
        applyFilter(geometry);
      }
      return;
    }

    if (store.drawMode === "rectangle") {
      if (!isDrawingRectangle) {
        rectangleStart = [e.lngLat.lng, e.lngLat.lat];
        isDrawingRectangle = true;
        map.getCanvas().style.cursor = "crosshair";
      } else if (rectangleStart) {
        const [x1, y1] = rectangleStart;
        const [x2, y2] = [e.lngLat.lng, e.lngLat.lat];
        const geometry: GeoJSON.Polygon = {
          type: "Polygon",
          coordinates: [
            [
              [x1, y1],
              [x2, y1],
              [x2, y2],
              [x1, y2],
              [x1, y1],
            ],
          ],
        };
        const wKm =
          Math.abs(x2 - x1) *
          111.32 *
          Math.cos((((y1 + y2) / 2) * Math.PI) / 180);
        const hKm = Math.abs(y2 - y1) * 111.32;
        store.filterAreaKm2 = wKm * hKm;
        store.filterRadiusKm = null;
        applyFilter(geometry);
      }
      return;
    }
  });

  // ── Polygon mode via MapboxDraw ───────────────────────────────────────────

  map.on("draw.create", (e: any) => {
    const feature = e.features[0];
    if (!feature?.geometry) return;
    store.filterRadiusKm = null;
    store.filterAreaKm2 = null;
    applyFilter(feature.geometry);
  });

  function startDraw(mode: DrawMode) {
    if (!mode) return;
    draw.deleteAll();
    store.clearFilter();
    store.drawMode = mode;
    store.liveRadiusKm = null;
    store.liveAreaKm2 = null;
    circleCenter = null;
    rectangleStart = null;
    isDrawingCircle = false;
    isDrawingRectangle = false;
    updatePreview(map, null);

    if (mode === "polygon") {
      map.getCanvas().style.cursor = "crosshair";
      draw.changeMode("draw_polygon");
    } else {
      map.getCanvas().style.cursor = "crosshair";
    }
  }

  function clearDraw() {
    draw.deleteAll();
    store.clearFilter();
    circleCenter = null;
    rectangleStart = null;
    isDrawingCircle = false;
    isDrawingRectangle = false;
    updatePreview(map, null); // ← clears on explicit clear only
    map.getCanvas().style.cursor = "";
  }
  function destroy() {
    try {
      map.removeControl(draw as any);
    } catch {}
    try {
      map.removeLayer("filter-preview-fill");
      map.removeLayer("filter-preview-stroke");
      map.removeSource("filter-preview");
    } catch {}
  }

  return { draw, startDraw, clearDraw, destroy };
}
