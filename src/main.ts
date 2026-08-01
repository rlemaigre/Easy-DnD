import { createApp } from 'vue';
import App from './App7.vue';

import Generic from './components/Generic.vue';

const app = createApp(App);
app.component('Generic', Generic);
app.mount('#app');
