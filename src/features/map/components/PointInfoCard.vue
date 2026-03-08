<script setup lang="ts">
import { ref } from "vue";
import { useMapStore } from "../store/mapStore";
import type { PointCard } from "../types/map.types";

const props = defineProps<{ card: PointCard }>();
const store = useMapStore();

const dragging = ref(false);
const pos = ref({ x: props.card.screenX, y: props.card.screenY });
let dragOffset = { x: 0, y: 0 };

function onMouseDown(e: MouseEvent) {
  dragging.value = true;
  dragOffset = { x: e.clientX - pos.value.x, y: e.clientY - pos.value.y };
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return;
  pos.value = {
    x: Math.max(0, Math.min(window.innerWidth - 260, e.clientX - dragOffset.x)),
    y: Math.max(
      0,
      Math.min(window.innerHeight - 300, e.clientY - dragOffset.y),
    ),
  };
}

function onMouseUp() {
  dragging.value = false;
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
}
</script>

<template>
  <div
    class="fixed z-30 w-60 rounded-xl border border-border bg-background/95 backdrop-blur-sm shadow-xl select-none"
    :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
  >
    <!-- Header / drag handle -->
    <div
      class="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-t-xl cursor-grab active:cursor-grabbing border-b border-border"
      @mousedown.prevent="onMouseDown"
    >
      <span class="text-xs font-semibold text-foreground truncate">
        {{ card.make }} {{ card.model }}
      </span>
      <div class="flex items-center gap-1 ml-2 shrink-0">
        <!-- Pin button -->
        <button
          :title="card.pinned ? 'Unpin' : 'Pin'"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-xs"
          :class="card.pinned ? 'text-blue-400' : 'text-muted-foreground'"
          @click="store.pinCard(card.id)"
        >
          📌
        </button>
        <!-- Close button -->
        <button
          title="Close"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-xs text-muted-foreground"
          @click="store.closeCard(card.id)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="px-3 py-2 flex flex-col gap-2">
      <!-- VIN -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] uppercase tracking-wide text-muted-foreground"
          >VIN</span
        >
        <span class="text-xs font-mono text-foreground break-all">{{
          card.vin
        }}</span>
      </div>

      <!-- Make / Model / Year -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] uppercase tracking-wide text-muted-foreground"
          >Vehicle</span
        >
        <span class="text-xs text-foreground"
          >{{ card.year }} {{ card.make }} {{ card.model }}</span
        >
      </div>

      <!-- Address -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] uppercase tracking-wide text-muted-foreground"
          >Address</span
        >
        <span class="text-xs text-foreground"
          >{{ card.city }}, {{ card.state }} {{ card.zip }}</span
        >
      </div>

      <!-- Carrier Route -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] uppercase tracking-wide text-muted-foreground"
          >Carrier Route</span
        >
        <span class="text-xs font-mono text-foreground">{{
          card.carrier_route
        }}</span>
      </div>

      <!-- Coordinates -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] uppercase tracking-wide text-muted-foreground"
          >Coordinates</span
        >
        <span class="text-xs font-mono text-muted-foreground">
          {{ card.lat.toFixed(5) }}, {{ card.lon.toFixed(5) }}
        </span>
      </div>
    </div>
  </div>
</template>
