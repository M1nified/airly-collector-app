import Vue from 'vue';
import HomeComponent from "./components/Home.vue";
import SensorComponent from "./components/Sensor.vue";
import SensorHistoryComponent from "./components/SensorHistory.vue";
import VueRouter from 'vue-router';

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

const app = new Vue({
    el: "#app",
    router
});
