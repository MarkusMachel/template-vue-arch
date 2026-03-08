import { defineStore } from "pinia";
import { ref } from "vue";
import { DEFAULT_STYLE } from "../utils/mapStyles";
import type { ColorMode, ColorScheme, PointCard } from "../types/map.types";
import type { HexStyle } from "../layers/deckH3Layer";

export type DrawMode = "circle" | "rectangle" | "polygon" | null;

export const useMapStore = defineStore("map", () => {
  // Layer opacity
  const hexagonOpacity = ref(0.8);
  const pointsOpacity = ref(0.9);
  const statesVisible = ref(false);
  const countiesVisible = ref(false);
  const zipsVisible = ref(false);
  const hexStyle = ref<HexStyle>("hexagon");
  const pointShape = ref<"circle" | "diamond" | "triangle">("circle");

  // Color mode
  const colorMode = ref<ColorMode>("make");
  const h3ResolutionOverride = ref<number | null>(null);

  // Point size
  const pointSize = ref(30000);

  // Hexagon color scheme
  const hexColorScheme = ref<ColorScheme>("blue-red");

  // Map settings
  const currentStyle = ref(DEFAULT_STYLE);
  const buildingsVisible = ref(false);
  const labelsVisible = ref(true);

  // Stats
  const totalVins = ref(0);
  const vinsByCategory = ref<Record<string, number>>({});

  // Panel
  const panelOpen = ref(true);

  // Spatial filter
  const drawMode = ref<DrawMode>(null);
  const activeFilterGeometry = ref<GeoJSON.Geometry | null>(null);
  const filterCount = ref<number | null>(null);
  const isFiltering = ref(false);

  // Live drawing stats (update on mousemove)
  const liveRadiusKm = ref<number | null>(null);
  const liveAreaKm2 = ref<number | null>(null);

  // Committed filter stats (set when filter is applied)
  const filterRadiusKm = ref<number | null>(null);
  const filterAreaKm2 = ref<number | null>(null);

  const pointCards = ref<PointCard[]>([]);
  const activeCard = ref<PointCard | null>(null);

  function openCard(card: PointCard) {
    // Replace unpinned card, keep pinned ones
    const unpinnedIdx = pointCards.value.findIndex((c) => !c.pinned);
    if (unpinnedIdx !== -1) {
      pointCards.value.splice(unpinnedIdx, 1);
    }
    pointCards.value.push(card);
    activeCard.value = card;
  }

  function pinCard(id: string) {
    const card = pointCards.value.find((c) => c.id === id);
    if (card) card.pinned = true;
  }

  function closeCard(id: string) {
    pointCards.value = pointCards.value.filter((c) => c.id !== id);
  }

  function clearCards() {
    pointCards.value = [];
    activeCard.value = null;
  }

  function setFilter(geometry: GeoJSON.Geometry) {
    activeFilterGeometry.value = geometry;
    filterCount.value = null;
  }

  function clearFilter() {
    activeFilterGeometry.value = null;
    filterCount.value = null;
    drawMode.value = null;
    isFiltering.value = false;
    liveRadiusKm.value = null;
    liveAreaKm2.value = null;
    filterRadiusKm.value = null;
    filterAreaKm2.value = null;
  }

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
    statesVisible,
    countiesVisible,
    zipsVisible,
    hexStyle,
    pointShape,
    drawMode,
    activeFilterGeometry,
    filterCount,
    isFiltering,
    liveRadiusKm,
    liveAreaKm2,
    filterRadiusKm,
    filterAreaKm2,
    setFilter,
    clearFilter,
    pointCards,
    activeCard,
    openCard,
    pinCard,
    closeCard,
    clearCards,
  };
});
