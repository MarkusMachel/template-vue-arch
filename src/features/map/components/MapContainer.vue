<script setup lang="ts">
import { onMounted, ref } from "vue";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MapSidePanel from "../components/MapSidePanel.vue";
import FilterToolbar from "../components/FilterToolbar.vue";
import PointCardManager from "../components/PointCardManager.vue";
import { useMap } from "../composables/useMap";
import { useMapStore } from "../store/mapStore";
import type { DrawMode } from "../store/mapStore";

const store = useMapStore();
const { initMap, map } = useMap();
const drawFilterRef = ref<any>(null);

onMounted(async () => {
  initMap("map-container");

  const checkMap = setInterval(() => {
    if (map.value) {
      clearInterval(checkMap);
      import("../composables/useDrawFilter").then(({ useDrawFilter }) => {
        drawFilterRef.value = useDrawFilter(map.value!, () => {});
      });
    }
  }, 100);
});

function handleStartDraw(mode: DrawMode) {
  drawFilterRef.value?.startDraw(mode);
}

function handleClearDraw() {
  drawFilterRef.value?.clearDraw();
}
</script>

<template>
  <SidebarProvider>
    <MapSidePanel />
    <div id="map-container" class="map-container" />
    <SidebarTrigger class="map-trigger" />
    <FilterToolbar
      @start-draw="handleStartDraw"
      @clear-draw="handleClearDraw"
    />
    <PointCardManager />
  </SidebarProvider>
</template>

<style scoped>
.map-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.map-trigger {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 30;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
</style>
