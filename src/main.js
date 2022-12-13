import { createApp } from 'vue'
import App from './App8.vue'

import Generic from "./components/Generic";

const app = createApp(App)
app.component('generic', Generic);
app.mount('#app');
