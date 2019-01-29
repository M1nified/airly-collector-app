import Vue from 'vue';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import VueRouter from 'vue-router';
import HomeComponent from "./components/Home.vue";
import InstallPromptComponent from "./components/InstallPrompt.vue";
import SensorComponent from "./components/Sensor.vue";
import SensorHistoryComponent from "./components/SensorHistory.vue";
import SettingsComponent from "./components/Settings.vue";
import { updateMeasurements } from "./airly/AirlyMeasurementsGathering";
import Store from "./Store";

const router = new VueRouter({
    routes: [
        {
            path: '/sensor/:id', name: 'sensor', component: SensorComponent,
            children: [
                {
                    path: 'history',
                    component: SensorHistoryComponent
                },
                {
                    path: '',
                    component: SensorHistoryComponent
                }
            ]
        },
        { path: '/sensors', name: 'sensors', component: HomeComponent },
        { path: '/settings', name: 'settings', component: SettingsComponent },
        { path: '/', redirect: 'sensors' },
        // { path: '*', redirect: 'home' }
    ]
})

Vue.use(VueRouter);
Vue.use(VueMaterial);

const app = new Vue({
    el: "#app",
    router,
    components: {
        InstallPromptComponent
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => navigator.serviceWorker.ready)
            .then(registration => {
                navigator.serviceWorker.ready.then(function (swRegistration) {
                    return swRegistration.sync.register('autoupdateAllSync');
                });
            })
    });
}
