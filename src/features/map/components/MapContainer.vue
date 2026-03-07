<script setup lang="ts">
import { onMounted } from "vue";
import { useMap } from "../composables/useMap";

const { initMap, setStyle, isLoaded } = useMap();

onMounted(() => {
  initMap("map-container");
});
</script>

<template>
  <div class="map-page">
    <div class="map-wrapper">
      <div id="map-container" class="map-container" />
      <div class="style-controls">
        <button @click="setStyle('bright')">Bright</button>
        <button @click="setStyle('dark')">Dark</button>
        <button @click="setStyle('liberty')">Liberty</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-page {
  width: 100%;
  height: 100vh;
}
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
}

.style-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
}
.style-controls button {
  padding: 6px 12px;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
</style>
