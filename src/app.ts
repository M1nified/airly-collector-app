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

const applicationPublicKey = 'BBUygSe8Yfsoruu7Mlt7mvaVzZ7iHLgEB1TPH4msN2nuJfVFkFhEsfZVN9fS9HEE7TQks9bbA4L67k17C01VI3c';

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
        navigator.serviceWorker.register('sw.js', { scope: '/airly-collector-app/' })
            .then(registration => navigator.serviceWorker.ready)
            .then(registration => {
                navigator.serviceWorker.ready.then(function (swRegistration) {
                    return swRegistration.sync.register('autoupdateAllSync');
                });
                navigator.serviceWorker.ready.then(function (swRegistration) {
                    swRegistration.pushManager.getSubscription()
                        .then(subscription => {
                            const isSubscribed = !(subscription === null);
                            if (isSubscribed) {
                                console.log('User IS subscribed.');
                            } else {
                                console.log('User is NOT subscribed.');
                            }
                            const applicationServerKey = urlBase64ToUint8Array(applicationPublicKey);
                            swRegistration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey
                            })
                                .then(function (subscription) {
                                    console.log('User is subscribed.');

                                    updateSubscriptionOnServer(subscription);

                                    // isSubscribed = true;

                                    // updateBtn();

                                })
                                .catch(function (err) {
                                    console.log('Failed to subscribe the user: ', err);
                                    // updateBtn();
                                });
                        })
                });
            })
    });
}


function updateSubscriptionOnServer(subscriptions: any) {
    // TODO: Send subscription to application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
        document.querySelector('.js-subscription-details');

    // if (subscription) {
    //   subscriptionJson.textContent = JSON.stringify(subscription);
    //   subscriptionDetails.classList.remove('is-invisible');
    // } else {
    //   subscriptionDetails.classList.add('is-invisible');
    // }
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

Notification.requestPermission().then(function (result) {
    console.log(result);
});

