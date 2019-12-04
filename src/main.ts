import "reflect-metadata"
import Vue from 'vue'
import App2 from './App2.vue'
import vuetify from './plugins/vuetify';
import '@babel/polyfill'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false

new Vue({
    vuetify,
    render: h => h(App2)
}).$mount('#app')
