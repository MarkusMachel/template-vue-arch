<script setup lang="ts">
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMapStore } from "../store/mapStore";
import { MAP_STYLES } from "../utils/mapStyles";
import { watch } from "vue";

const store = useMapStore();

function handleStyleChange(styleName: string) {
  store.currentStyle = MAP_STYLES[styleName] as string;
}

watch(
  () => store.buildingsVisible,
  (val) => console.log("store buildings changed:", val),
);
</script>

<template>
  <div class="flex flex-col gap-4 py-2">
    <!-- Base Map Style -->
    <div class="flex flex-col gap-2">
      <Label class="text-xs font-medium">Base Map</Label>
      <div class="flex flex-col gap-1">
        <button
          v-for="style in ['bright', 'dark', 'liberty'] as const"
          :key="style"
          class="text-xs px-3 py-1.5 rounded-md text-left transition-colors capitalize"
          :class="
            store.currentStyle === MAP_STYLES[style]
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground'
          "
          @click="handleStyleChange(style)"
        >
          {{ style }}
        </button>
      </div>
    </div>

    <Separator />

    <!-- 3D Buildings -->
    <div class="flex items-center justify-between">
      <Label class="text-xs font-medium">3D Buildings</Label>
      <Switch v-model:checked="store.buildingsVisible" />
    </div>

    <Separator />

    <!-- Road Labels -->
    <div class="flex items-center justify-between">
      <Label class="text-xs font-medium">Road Labels</Label>
      <Switch v-model:checked="store.labelsVisible" />
    </div>
  </div>
</template>
