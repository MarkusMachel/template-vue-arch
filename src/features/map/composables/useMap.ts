import { onUnmounted, shallowRef, watch } from "vue";
import type { MapConfig } from "../types/map.types";
import { DEFAULT_STYLE } from "../utils/mapStyles";
import maplibregl, { Map } from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Layer } from "@deck.gl/core";
import { createVinScatterplotLayer } from "../layers/deckPointsLayer";
import { createH3Layer } from "../layers/deckH3Layer";
import { useMapStore } from "../store/mapStore";

const DEFAULT_CONFIG: MapConfig = {
  center: [-98.5795, 39.8283],
  zoom: 4,
  style: DEFAULT_STYLE,
};

export function useMap() {
  const map = shallowRef<Map | null>(null);
  const isLoaded = shallowRef(false);
  const deckOverlay = shallowRef<MapboxOverlay | null>(null);
  const store = useMapStore();

  function getDeckLayers(zoom: number) {
    const zoomHexOpacity = Math.max(
      0,
      Math.min(store.hexagonOpacity, (8 - zoom) / 2),
    );
    const zoomPointOpacity = Math.max(
      0,
      Math.min(store.pointsOpacity, (zoom - 6) / 2),
    );
    const resolution = store.h3ResolutionOverride ?? (zoom < 5 ? 2 : 3);

    return [
      createH3Layer(resolution, zoomHexOpacity, store.hexColorScheme),
      createVinScatterplotLayer(
        (vin) => console.log("clicked:", vin),
        (vin) => {
          const canvas = map.value?.getCanvas();
          if (canvas) canvas.style.cursor = vin ? "pointer" : "grab";
        },
        zoomPointOpacity,
        store.colorMode,
        store.pointSize,
      ),
    ];
  }

  function refreshLayers() {
    if (!map.value || !deckOverlay.value) return;
    deckOverlay.value.setProps({
      layers: getDeckLayers(map.value.getZoom()),
    });
  }

  function initDeck() {
    if (!map.value) return;
    deckOverlay.value = new MapboxOverlay({
      interleaved: true,
      layers: getDeckLayers(map.value.getZoom()),
      getCursor: ({ isHovering }) => (isHovering ? "pointer" : "grab"),
    });
    map.value.addControl(deckOverlay.value as any);

    map.value.on("zoom", () => {
      refreshLayers();
    });
  }

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

  function initMap(containerId: string, config: MapConfig = DEFAULT_CONFIG) {
    map.value = new maplibregl.Map({
      container: containerId,
      style: config.style,
      center: config.center,
      zoom: config.zoom,
    });

    map.value.addControl(new maplibregl.NavigationControl(), "top-right");

    map.value.on("load", () => {
      isLoaded.value = true;
      initDeck();
      const layers = map.value?.getStyle()?.layers;
      console.log(
        "All layers:",
        layers?.map((l) => ({ id: l.id, type: l.type })),
      );
      // Watch layer store properties
      watch(
        () => [
          store.hexagonOpacity,
          store.pointsOpacity,
          store.colorMode,
          store.h3ResolutionOverride,
          store.pointSize,
          store.hexColorScheme,
        ],
        () => refreshLayers(),
        { deep: true },
      );

      // Watch style changes
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

      // Watch buildings
      watch(
        () => store.buildingsVisible,
        (visible) => applyBuildingVisibility(visible),
      );

      // Watch labels
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

  onUnmounted(() => {
    destroyMap();
  });

  return {
    map,
    isLoaded,
    deckOverlay,
    initMap,
    destroyMap,
    setDeckLayers: (layers: Layer[]) => deckOverlay.value?.setProps({ layers }),
  };
}
