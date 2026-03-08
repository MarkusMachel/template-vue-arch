import { onUnmounted, shallowRef, watch, ref } from "vue";
import type { MapConfig } from "../types/map.types";
import { DEFAULT_STYLE } from "../utils/mapStyles";
import maplibregl, { Map as MaplibreMap } from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Layer } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
import { createH3Layer } from "../layers/deckH3Layer";
import { createMVTPointLayer } from "../layers/deckMVTLayer";
import { useMapStore } from "../store/mapStore";
import type { H3Cell } from "../utils/mockH3Data";
import { createBoundaryLayer } from "../layers/deckBoundaryLayers";

const DEFAULT_CONFIG: MapConfig = {
  center: [-98.5795, 39.8283],
  zoom: 4,
  style: DEFAULT_STYLE,
};

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

function getResolutionForZoom(zoom: number): number {
  if (zoom < 4) return 3;
  if (zoom < 6) return 4;
  if (zoom < 8) return 5;
  if (zoom < 10) return 6;
  return 7;
}

const MVT_ZOOM_THRESHOLD = 10;

export function useMap() {
  const map = shallowRef<MaplibreMap | null>(null);
  const isLoaded = shallowRef(false);
  const deckOverlay = shallowRef<MapboxOverlay | null>(null);
  const store = useMapStore();
  const h3Data = ref<H3Cell[]>([]);
  const filteredPoints = ref<any[]>([]);

  // ── Point click handler ────────────────────────────────────────────────────

  async function handlePointClick(
    properties: any,
    screenX: number,
    screenY: number,
  ) {
    const vin = properties?.vin;
    if (!vin) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vins/${vin}`,
      );
      if (!res.ok) return;
      const data = await res.json();

      store.openCard({
        id: `${vin}-${Date.now()}`,
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: data.year,
        city: data.city,
        state: data.state,
        zip: data.zip,
        carrier_route: data.carrier_route,
        lat: data.lat,
        lon: data.lon,
        screenX: Math.min(screenX + 12, window.innerWidth - 272),
        screenY: Math.min(screenY - 20, window.innerHeight - 340),
        pinned: false,
      });
    } catch (e) {
      console.error("Failed to fetch VIN details", e);
    }
  }

  // ── H3 fetching ────────────────────────────────────────────────────────────

  async function loadH3Data(resolution: number): Promise<H3Cell[]> {
    if (!map.value) return [];
    const bounds = map.value.getBounds();

    if (store.activeFilterGeometry) {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/h3/filter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: store.activeFilterGeometry,
          resolution,
        }),
      });
      const data = await res.json();
      store.filterCount = data.total ?? null;
      return data.h3Cells ?? [];
    }

    const params = new URLSearchParams({
      resolution: String(resolution),
      minLat: String(bounds.getSouth()),
      maxLat: String(bounds.getNorth()),
      minLon: String(bounds.getWest()),
      maxLon: String(bounds.getEast()),
    });
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/h3?${params}`);
    return res.json();
  }

  async function fetchH3Data() {
    if (!map.value) return;
    const zoom = map.value.getZoom();
    if (zoom >= MVT_ZOOM_THRESHOLD && !store.activeFilterGeometry) return;
    const resolution = store.h3ResolutionOverride ?? getResolutionForZoom(zoom);
    h3Data.value = await loadH3Data(resolution);
    refreshLayers();
  }

  // ── Filtered points fetching ───────────────────────────────────────────────

  async function fetchFilteredPoints() {
    if (!store.activeFilterGeometry) {
      filteredPoints.value = [];
      return;
    }
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/points/filter`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: store.activeFilterGeometry,
          resolution: 4,
        }),
      },
    );
    filteredPoints.value = await res.json();
    refreshLayers();
  }

  // ── Layers ─────────────────────────────────────────────────────────────────

  function getDeckLayers(zoom: number) {
    const resolution = store.h3ResolutionOverride ?? getResolutionForZoom(zoom);
    const showHexagons = zoom < MVT_ZOOM_THRESHOLD;
    const zoomHexOpacity = showHexagons
      ? Math.max(
          0,
          Math.min(store.hexagonOpacity, (MVT_ZOOM_THRESHOLD - zoom) / 2),
        )
      : 0;
    const zoomPointOpacity = !showHexagons
      ? store.pointsOpacity
      : Math.max(
          0,
          Math.min(store.pointsOpacity, (zoom - (MVT_ZOOM_THRESHOLD - 2)) / 2),
        );

    const pointsLayer = store.activeFilterGeometry
      ? new ScatterplotLayer({
          id: "vin-filtered-points",
          data: filteredPoints.value,
          opacity: zoomPointOpacity,
          getPosition: (d: any) => [d.lon, d.lat],
          getRadius: 50,
          radiusMinPixels: 4,
          radiusMaxPixels: 12,
          getFillColor: (d: any) =>
            store.colorMode === "make"
              ? (MAKE_COLORS[d.make] ?? DEFAULT_COLOR)
              : DEFAULT_COLOR,
          pickable: true,
          onClick: (info: any) => {
            if (info.object && info.pixel) {
              handlePointClick(info.object, info.pixel[0], info.pixel[1]);
            }
          },
        })
      : createMVTPointLayer(
          zoomPointOpacity,
          store.colorMode,
          store.pointShape,
          `${import.meta.env.VITE_API_URL}/tiles/{z}/{x}/{y}`,
          (feature, screenX, screenY) =>
            handlePointClick(feature.properties, screenX, screenY),
        );

    return [
      createBoundaryLayer("states", zoom, store.statesVisible),
      createBoundaryLayer("counties", zoom, store.countiesVisible),
      createBoundaryLayer("zips", zoom, store.zipsVisible),
      createH3Layer(
        h3Data.value,
        resolution,
        zoomHexOpacity,
        store.hexColorScheme,
        store.hexStyle,
      ),
      pointsLayer,
    ];
  }

  function refreshLayers() {
    if (!map.value || !deckOverlay.value) return;
    deckOverlay.value.setProps({
      layers: getDeckLayers(map.value.getZoom()),
    });
  }

  async function applyFilterRefresh() {
    await fetchH3Data();
    await fetchFilteredPoints();
    refreshLayers();
  }

  // ── Deck init ──────────────────────────────────────────────────────────────

  function initDeck() {
    if (!map.value) return;
    deckOverlay.value = new MapboxOverlay({
      interleaved: true,
      layers: getDeckLayers(map.value.getZoom()),
      getCursor: ({ isHovering }) => (isHovering ? "pointer" : "grab"),
    });
    map.value.addControl(deckOverlay.value as any);
    map.value.on("zoom", () => refreshLayers());
    map.value.on("moveend", () => fetchH3Data());
  }

  // ── Visibility helpers ─────────────────────────────────────────────────────

  function applyBuildingVisibility(visible: boolean) {
    if (!map.value) return;
    const visibility = visible ? "visible" : "none";
    ["building", "building-top"].forEach((id) => {
      if (map.value!.getLayer(id)) {
        map.value!.setLayoutProperty(id, "visibility", visibility);
      }
    });
  }

  function applyLabelVisibility(visible: boolean) {
    if (!map.value) return;
    const visibility = visible ? "visible" : "none";
    [
      "road_oneway",
      "road_oneway_opposite",
      "waterway_line_label",
      "water_name_point_label",
      "water_name_line_label",
      "poi_r20",
      "poi_r7",
      "poi_r1",
      "poi_transit",
      "highway-name-path",
      "highway-name-minor",
      "highway-name-major",
      "highway-shield-non-us",
      "highway-shield-us-interstate",
      "road_shield_us",
      "airport",
      "label_other",
      "label_village",
      "label_town",
      "label_state",
      "label_city",
      "label_city_capital",
      "label_country_3",
      "label_country_2",
      "label_country_1",
    ].forEach((id) => {
      if (map.value!.getLayer(id)) {
        map.value!.setLayoutProperty(id, "visibility", visibility);
      }
    });
  }

  // ── Map init ───────────────────────────────────────────────────────────────

  function initMap(containerId: string, config: MapConfig = DEFAULT_CONFIG) {
    map.value = new maplibregl.Map({
      container: containerId,
      style: config.style,
      center: config.center,
      zoom: config.zoom,
    });

    map.value.addControl(new maplibregl.NavigationControl(), "top-right");

    map.value.on("load", async () => {
      isLoaded.value = true;
      await fetchH3Data();
      initDeck();

      watch(
        () => [
          store.hexagonOpacity,
          store.pointsOpacity,
          store.colorMode,
          store.h3ResolutionOverride,
          store.pointSize,
          store.hexColorScheme,
          store.statesVisible,
          store.countiesVisible,
          store.zipsVisible,
          store.hexStyle,
          store.pointShape,
        ],
        () => refreshLayers(),
        { deep: true },
      );

      watch(
        () => store.activeFilterGeometry,
        async (geom) => {
          if (geom) {
            await fetchH3Data();
            await fetchFilteredPoints();
          } else {
            filteredPoints.value = [];
            await fetchH3Data();
          }
          refreshLayers();
        },
      );

      watch(
        () => store.currentStyle,
        (newStyle) => {
          if (!map.value) return;
          isLoaded.value = false;
          map.value.setStyle(newStyle);
          map.value.once("style.load", () => {
            isLoaded.value = true;
            applyBuildingVisibility(store.buildingsVisible);
            applyLabelVisibility(store.labelsVisible);
          });
        },
      );

      watch(
        () => store.buildingsVisible,
        (visible) => applyBuildingVisibility(visible),
      );
      watch(
        () => store.labelsVisible,
        (visible) => applyLabelVisibility(visible),
      );
    });
  }

  function destroyMap() {
    map.value?.remove();
    map.value = null;
    deckOverlay.value = null;
    isLoaded.value = false;
  }

  onUnmounted(() => destroyMap());

  return {
    map,
    isLoaded,
    deckOverlay,
    initMap,
    destroyMap,
    applyFilterRefresh,
    setDeckLayers: (layers: Layer[]) => deckOverlay.value?.setProps({ layers }),
  };
}
