import type { Map } from "maplibre-gl";
import { MOCK_VIN_POINTS, toGeoJSON } from "../utils/mockPoints";

const SOURCE_ID = "vin-points";
const LAYER_ID = "vin-points-layer";

export function addPointsLayer(map: Map) {
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: toGeoJSON(MOCK_VIN_POINTS),
  });

  map.addLayer({
    id: LAYER_ID,
    type: "circle",
    source: SOURCE_ID,
    paint: {
      "circle-color": [
        "match",
        ["get", "make"],
        "Chevrolet",
        "#e74c3c",
        "Honda",
        "#3498db",
        "Toyota",
        "#2ecc71",
        "Ford",
        "#e67e22",
        "Volkswagen",
        "#9b59b6",
        "Nissan",
        "#1abc9c",
        "Tesla",
        "#e91e63",
        "#aaaaaa",
      ],
      "circle-opacity": 0.9,
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        5,
        10,
        8,
        15,
        12,
      ],
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    } as any,
  });
}

export function removePointsLayer(map: Map) {
  if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}
