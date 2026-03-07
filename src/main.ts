import { createApp } from "vue";
import "./style.css";
import "maplibre-gl/dist/maplibre-gl.css";
import App from "./App.vue";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
