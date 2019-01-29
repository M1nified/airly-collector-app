import Vue from 'vue';
import HomeComponent from "./components/Home.vue";
import SensorComponent from "./components/Sensor.vue";
import SensorHistoryComponent from "./components/SensorHistory.vue";
import InstallPromptComponent from "./components/InstallPrompt.vue";
import VueRouter from 'vue-router';
import VueMaterial from 'vue-material';
import {
    MdButton,
    MdField,
    MdContent,
    MdTabs,
    // MdInput
} from 'vue-material/dist/components';
import 'vue-material/dist/vue-material.min.css';

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
        { path: '/', redirect: 'sensors' },
        // { path: '*', redirect: 'home' }
    ]
})

Vue.use(VueRouter);
// Vue.use(MdButton);
// Vue.use(MdField);
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
        navigator.serviceWorker.register('/sw.js');
    })
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    console.info('beforeinstallprompt')
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
});
