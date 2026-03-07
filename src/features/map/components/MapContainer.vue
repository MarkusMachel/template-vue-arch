<script setup lang="ts">
import { onMounted } from "vue";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MapSidePanel from "../components/MapSidePanel.vue";
import { useMap } from "../composables/useMap";

const { initMap } = useMap();

onMounted(() => {
  initMap("map-container");
});
</script>

<template>
  <SidebarProvider>
    <MapSidePanel />
    <div id="map-container" class="map-container" />
    <SidebarTrigger class="map-trigger" />
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
