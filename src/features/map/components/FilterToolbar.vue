<script setup lang="ts">
import { ref, computed } from "vue";
import { useMapStore } from "../store/mapStore";
import type { DrawMode } from "../store/mapStore";

const store = useMapStore();
const emit = defineEmits<{
  (e: "startDraw", mode: DrawMode): void;
  (e: "clearDraw"): void;
}>();

// ── Draggable ─────────────────────────────────────────────────────────────
const toolbarRef = ref<HTMLDivElement | null>(null);
const pos = ref({ x: window.innerWidth - 64, y: 16 });
let dragging = false;
let dragOffset = { x: 0, y: 0 };

function onMouseDown(e: MouseEvent) {
  dragging = true;
  dragOffset = {
    x: e.clientX - pos.value.x,
    y: e.clientY - pos.value.y,
  };
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!dragging) return;
  pos.value = {
    x: Math.max(0, Math.min(window.innerWidth - 48, e.clientX - dragOffset.x)),
    y: Math.max(
      0,
      Math.min(window.innerHeight - 200, e.clientY - dragOffset.y),
    ),
  };
}

function onMouseUp() {
  dragging = false;
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
}

// ── Units toggle ──────────────────────────────────────────────────────────
const useKm = ref(true);

function formatRadius(km: number | null): string {
  if (km === null) return "";
  if (useKm.value) return `${km.toFixed(1)} km`;
  return `${(km * 0.621371).toFixed(1)} mi`;
}

function formatArea(km2: number | null): string {
  if (km2 === null) return "";
  if (useKm.value) return `${km2.toFixed(1)} km²`;
  return `${(km2 * 0.386102).toFixed(1)} mi²`;
}

const isDrawing = computed(() => store.drawMode !== null);
const hasFilter = computed(() => store.activeFilterGeometry !== null);

const liveRadius = computed(() => formatRadius(store.liveRadiusKm));
const liveArea = computed(() => formatArea(store.liveAreaKm2));
const filterRadius = computed(() => formatRadius(store.filterRadiusKm));
const filterArea = computed(() => formatArea(store.filterAreaKm2));

const tools: { mode: DrawMode; icon: string; label: string }[] = [
  { mode: "circle", icon: "⊙", label: "Circle" },
  { mode: "rectangle", icon: "▭", label: "Rectangle" },
  { mode: "polygon", icon: "⬠", label: "Polygon" },
];
</script>

<template>
  <div
    ref="toolbarRef"
    class="fixed z-20 select-none"
    :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
  >
    <div
      class="flex flex-col gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-xl overflow-hidden min-w-[48px]"
    >
      <!-- Drag handle -->
      <div
        class="flex items-center justify-center h-6 cursor-grab active:cursor-grabbing bg-muted/50 hover:bg-muted transition-colors"
        @mousedown.prevent="onMouseDown"
      >
        <span class="text-muted-foreground text-xs">⠿</span>
      </div>

      <!-- Draw tools -->
      <div class="flex flex-col gap-1 p-1">
        <button
          v-for="tool in tools"
          :key="tool.label"
          :title="tool.label"
          class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
          :class="
            store.drawMode === tool.mode
              ? 'bg-blue-500 text-white shadow-inner'
              : 'hover:bg-accent text-foreground'
          "
          @click="emit('startDraw', tool.mode)"
        >
          {{ tool.icon }}
        </button>
      </div>

      <!-- Divider -->
      <div v-if="hasFilter || isDrawing" class="border-t border-border mx-1" />

      <!-- Live drawing stats -->
      <div
        v-if="isDrawing && (liveRadius || liveArea)"
        class="px-2 py-1 flex flex-col gap-0.5"
      >
        <span
          v-if="liveRadius"
          class="text-xs text-blue-400 font-mono whitespace-nowrap"
        >
          r {{ liveRadius }}
        </span>
        <span
          v-if="liveArea"
          class="text-xs text-muted-foreground font-mono whitespace-nowrap"
        >
          {{ liveArea }}
        </span>
      </div>

      <!-- Committed filter stats -->
      <div v-if="hasFilter" class="px-2 py-1 flex flex-col gap-0.5">
        <span
          v-if="filterRadius"
          class="text-xs text-blue-400 font-mono whitespace-nowrap"
        >
          r {{ filterRadius }}
        </span>
        <span
          v-if="filterArea"
          class="text-xs text-muted-foreground font-mono whitespace-nowrap"
        >
          {{ filterArea }}
        </span>
        <span
          v-if="store.filterCount !== null"
          class="text-xs text-emerald-400 font-mono whitespace-nowrap"
        >
          {{ store.filterCount.toLocaleString() }} VINs
        </span>
      </div>

      <!-- Divider -->
      <div v-if="hasFilter" class="border-t border-border mx-1" />

      <!-- Units toggle + clear -->
      <div v-if="hasFilter || isDrawing" class="flex flex-col gap-1 p-1">
        <button
          class="w-9 h-6 flex items-center justify-center rounded text-xs text-muted-foreground hover:bg-accent transition-colors font-mono"
          :title="`Switch to ${useKm ? 'miles' : 'km'}`"
          @click="useKm = !useKm"
        >
          {{ useKm ? "km" : "mi" }}
        </button>
        <button
          v-if="hasFilter"
          title="Clear filter"
          class="w-9 h-9 flex items-center justify-center rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          @click="emit('clearDraw')"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>
