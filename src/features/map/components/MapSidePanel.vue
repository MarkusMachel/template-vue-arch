<script setup lang="ts">
import { Layers, Map, BarChart2, Palette, ChevronRight } from "lucide-vue-next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import LayerControls from "../components/LayersControls.vue";
import MapSettings from "./MapSettings.vue";
</script>

<template>
  <Sidebar>
    <SidebarHeader class="border-b px-4 py-3">
      <div class="flex items-center gap-2">
        <Map class="h-5 w-5 text-primary" />
        <span class="font-semibold text-sm">VIN Analytics</span>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <!-- Stats -->
      <Collapsible default-open class="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel
            as-child
            class="text-xs text-muted-foreground hover:text-foreground"
          >
            <CollapsibleTrigger
              class="flex w-full items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <BarChart2 class="h-4 w-4" />
                Stats
              </div>
              <ChevronRight
                class="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90"
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent class="px-2 py-2">
              <p class="text-xs text-muted-foreground">
                Stats panel coming soon
              </p>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <!-- Layers -->
      <Collapsible default-open class="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel
            as-child
            class="text-xs text-muted-foreground hover:text-foreground"
          >
            <CollapsibleTrigger
              class="flex w-full items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <Layers class="h-4 w-4" />
                Layers
              </div>
              <ChevronRight
                class="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90"
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent class="px-2 py-2">
              <LayerControls />
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <!-- Map Settings -->
      <Collapsible default-open class="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel
            as-child
            class="text-xs text-muted-foreground hover:text-foreground"
          >
            <CollapsibleTrigger
              class="flex w-full items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <Map class="h-4 w-4" />
                Map Settings
              </div>
              <ChevronRight
                class="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90"
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent class="px-2 py-2">
              <MapSettings />
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <!-- Legend -->
      <Collapsible default-open class="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel
            as-child
            class="text-xs text-muted-foreground hover:text-foreground"
          >
            <CollapsibleTrigger
              class="flex w-full items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <Palette class="h-4 w-4" />
                Legend
              </div>
              <ChevronRight
                class="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90"
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent class="px-2 py-2">
              <p class="text-xs text-muted-foreground">Legend coming soon</p>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </SidebarContent>
  </Sidebar>
</template>
