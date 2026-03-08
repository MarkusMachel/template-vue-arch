<script setup lang="ts">
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMapStore } from "../store/mapStore";

const store = useMapStore();

function updateHexOpacity(val: number[] | undefined) {
  if (val && val[0] !== undefined) store.hexagonOpacity = val[0];
}

function updatePointOpacity(val: number[] | undefined) {
  if (val && val[0] !== undefined) store.pointsOpacity = val[0];
}

function updatePointSize(val: number[] | undefined) {
  if (val && val[0] !== undefined) store.pointSize = val[0];
}

function updateH3Resolution(val: number[] | undefined) {
  if (val && val[0] !== undefined) {
    store.h3ResolutionOverride = val[0] === 0 ? null : val[0];
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 py-2">
    <!-- Hexagon Opacity -->
    <div class="flex flex-col gap-3">
      <Label class="text-xs font-medium">
        Hexagon Opacity {{ Math.round(store.hexagonOpacity * 100) }}%
      </Label>
      <Slider
        :model-value="[store.hexagonOpacity]"
        :min="0"
        :max="1"
        :step="0.05"
        @update:model-value="updateHexOpacity($event)"
      />
    </div>

    <!-- H3 Resolution -->
    <div class="flex flex-col gap-3">
      <Label class="text-xs font-medium">
        H3 Resolution
        {{
          store.h3ResolutionOverride === null
            ? "(Auto)"
            : store.h3ResolutionOverride
        }}
      </Label>
      <Slider
        :model-value="[store.h3ResolutionOverride ?? 0]"
        :min="0"
        :max="6"
        :step="1"
        @update:model-value="updateH3Resolution($event)"
      />
      <span class="text-xs text-muted-foreground">0 = auto based on zoom</span>
    </div>

    <!-- Density Style -->
    <div class="flex flex-col gap-2">
      <Label class="text-xs font-medium">Density Style</Label>
      <div class="flex gap-2">
        <button
          v-for="style in ['hexagon', 'bubble'] as const"
          :key="style"
          class="flex-1 text-xs px-3 py-1.5 rounded-md transition-colors"
          :class="
            store.hexStyle === style
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground'
          "
          @click="store.hexStyle = style"
        >
          {{ style === "hexagon" ? "⬡ Hexagon" : "● Bubble" }}
        </button>
      </div>
    </div>

    <!-- Hexagon Color Scheme -->
    <div class="flex flex-col gap-2">
      <Label class="text-xs font-medium">Color Scheme</Label>
      <div class="flex flex-col gap-1">
        <button
          v-for="scheme in [
            'blue-red',
            'green-yellow',
            'purple-orange',
          ] as const"
          :key="scheme"
          class="text-xs px-3 py-1.5 rounded-md text-left transition-colors"
          :class="
            store.hexColorScheme === scheme
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground'
          "
          @click="store.hexColorScheme = scheme"
        >
          {{
            scheme === "blue-red"
              ? "Blue → Red"
              : scheme === "green-yellow"
                ? "Green → Yellow"
                : "Purple → Orange"
          }}
        </button>
      </div>
    </div>

    <Separator />

    <!-- Points Opacity -->
    <div class="flex flex-col gap-3">
      <Label class="text-xs font-medium">
        Points Opacity {{ Math.round(store.pointsOpacity * 100) }}%
      </Label>
      <Slider
        :model-value="[store.pointsOpacity]"
        :min="0"
        :max="1"
        :step="0.05"
        @update:model-value="updatePointOpacity($event)"
      />
    </div>

    <!-- Point Size -->
    <div class="flex flex-col gap-3">
      <Label class="text-xs font-medium">
        Point Size {{ store.pointSize / 1000 }}km
      </Label>
      <Slider
        :model-value="[store.pointSize]"
        :min="5000"
        :max="100000"
        :step="5000"
        @update:model-value="updatePointSize($event)"
      />
    </div>

    <!-- Point Shape -->
    <div class="flex flex-col gap-2">
      <Label class="text-xs font-medium">Point Shape</Label>
      <div class="flex gap-2">
        <button
          v-for="shape in ['circle', 'diamond', 'triangle'] as const"
          :key="shape"
          class="flex-1 text-xs px-3 py-1.5 rounded-md transition-colors"
          :class="
            store.pointShape === shape
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground'
          "
          @click="store.pointShape = shape"
        >
          {{
            shape === "circle"
              ? "● Circle"
              : shape === "diamond"
                ? "◆ Diamond"
                : "▲ Triangle"
          }}
        </button>
      </div>
    </div>

    <Separator />

    <!-- Color Mode -->
    <div class="flex flex-col gap-2">
      <Label class="text-xs font-medium">Color By</Label>
      <div class="flex flex-col gap-1">
        <button
          v-for="mode in ['make', 'fuelType', 'recallFlag'] as const"
          :key="mode"
          class="text-xs px-3 py-1.5 rounded-md text-left transition-colors"
          :class="
            store.colorMode === mode
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground'
          "
          @click="store.colorMode = mode"
        >
          {{
            mode === "make"
              ? "Make"
              : mode === "fuelType"
                ? "Fuel Type"
                : "Recall Flag"
          }}
        </button>
      </div>
    </div>

    <Separator />

    <!-- Boundaries -->
    <div class="flex flex-col gap-3">
      <Label class="text-xs font-medium">Boundaries</Label>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <Label class="text-xs text-muted-foreground">States</Label>
          <button
            class="text-xs px-3 py-1 rounded-md transition-colors"
            :class="
              store.statesVisible
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-muted-foreground'
            "
            @click="store.statesVisible = !store.statesVisible"
          >
            {{ store.statesVisible ? "On" : "Off" }}
          </button>
        </div>
        <div class="flex items-center justify-between">
          <Label class="text-xs text-muted-foreground">Counties</Label>
          <button
            class="text-xs px-3 py-1 rounded-md transition-colors"
            :class="
              store.countiesVisible
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-muted-foreground'
            "
            @click="store.countiesVisible = !store.countiesVisible"
          >
            {{ store.countiesVisible ? "On" : "Off" }}
          </button>
        </div>
        <div class="flex items-center justify-between">
          <Label class="text-xs text-muted-foreground">ZIP Codes</Label>
          <button
            class="text-xs px-3 py-1 rounded-md transition-colors"
            :class="
              store.zipsVisible
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-muted-foreground'
            "
            @click="store.zipsVisible = !store.zipsVisible"
          >
            {{ store.zipsVisible ? "On" : "Off" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
