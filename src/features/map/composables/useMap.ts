import { onUnmounted, shallowRef } from "vue";
import type { MapConfig } from "../types/map.types";
import { DEFAULT_STYLE, MAP_STYLES } from "../utils/mapStyles";
import maplibregl, { Map } from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Layer } from "@deck.gl/core";
import { createVinScatterplotLayer } from "../layers/deckPointsLayer";
import { createH3Layer } from "../layers/deckH3Layer";

const DEFAULT_CONFIG: MapConfig = {
  center: [-98.5795, 39.8283],
  zoom: 4,
  style: DEFAULT_STYLE,
};

export function useMap() {
  const map = shallowRef<Map | null>(null);
  const isLoaded = shallowRef(false);
  const deckOverlay = shallowRef<MapboxOverlay | null>(null);

  function getDeckLayers(zoom: number) {
    const showHexagons = zoom < 8;
    const showPoints = zoom > 6;

    const hexagonOpacity = Math.max(0, Math.min(1, (8 - zoom) / 2));
    const pointOpacity = Math.max(0, Math.min(1, (zoom - 6) / 2));

    return [
      createH3Layer(zoom < 5 ? 2 : 3, hexagonOpacity),
      createVinScatterplotLayer(
        (vin) => console.log("clicked:", vin),
        (vin) => {
          const canvas = map.value?.getCanvas();
          if (canvas) canvas.style.cursor = vin ? "pointer" : "grab";
        },
        pointOpacity,
      ),
    ];
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
      if (!map.value || !deckOverlay.value) return;
      deckOverlay.value.setProps({
        layers: getDeckLayers(map.value.getZoom()),
      });
    });
  }
  function setDeckLayers(layers: Layer[]) {
    deckOverlay.value?.setProps({ layers });
  }

  function addLayers() {
    if (!map.value) return;
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
      addLayers();
    });
  }

  function setStyle(styleName: string) {
    if (!map.value) return;
    const styleUrl = MAP_STYLES[styleName];
    if (!styleUrl) return;
    isLoaded.value = false;
    map.value.setStyle(styleUrl);
    map.value.once("style.load", () => {
      isLoaded.value = true;
      addLayers();
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
    setStyle,
    setDeckLayers,
  };
}
