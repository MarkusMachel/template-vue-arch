<script setup lang="ts">
import { useMapStore } from "../store/mapStore";
import PointInfoCard from "./PointInfoCard.vue";

const store = useMapStore();
</script>

<template>
  <PointInfoCard v-for="card in store.pointCards" :key="card.id" :card="card" />
</template>
