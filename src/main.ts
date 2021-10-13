import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'custom-event-polyfill'
import "reflect-metadata"
import Vue from 'vue'
import App from './App12.vue'
import vuetify from './plugins/vuetify';
import '@babel/polyfill'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import Generic from "@/components/Generic.vue";

Vue.config.productionTip = false

Vue.component("generic", Generic);

new Vue({
    vuetify,
    render: h => h(App)
}).$mount('#app')
