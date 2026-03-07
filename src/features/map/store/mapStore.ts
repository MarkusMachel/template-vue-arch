import { defineStore } from "pinia";
import { ref } from "vue";
import { DEFAULT_STYLE } from "../utils/mapStyles";
import type { ColorMode } from "../types/map.types";

export const useMapStore = defineStore("map", () => {
  // Layer opacity
  const hexagonOpacity = ref(0.8);
  const pointsOpacity = ref(0.9);

  // Color mode
  const colorMode = ref<ColorMode>("make");

  // H3 resolution (null = auto based on zoom)
  const h3ResolutionOverride = ref<number | null>(null);

  // Point size
  const pointSize = ref(30000);

  // Hexagon color scheme
  const hexColorScheme = ref<"blue-red" | "green-yellow" | "purple-orange">(
    "blue-red",
  );

  // Map settings
  const currentStyle = ref(DEFAULT_STYLE);
  const buildingsVisible = ref(false);
  const labelsVisible = ref(true);

  // Stats
  const totalVins = ref(0);
  const vinsByCategory = ref<Record<string, number>>({});

  // Panel
  const panelOpen = ref(true);

  return {
    hexagonOpacity,
    pointsOpacity,
    colorMode,
    h3ResolutionOverride,
    pointSize,
    hexColorScheme,
    currentStyle,
    buildingsVisible,
    labelsVisible,
    totalVins,
    vinsByCategory,
    panelOpen,
  };
});
