<template>
  <div>
    <my-md-app-component v-bind:toolbar-title="toolbarTitle()">
      <!-- <p>Installation Id: {{id}}</p> -->
      <!-- <p
        class="info-location"
      >{{info.location && `${info.location.latitude}, ${info.location.longitude}`}}</p>-->
      <!-- <p class="info-address">{{info.address && `${info.address.country}, ${info.address.city}`}}</p> -->
      <!-- <p class="info-sponsor">{{info.sponsor && info.sponsor.name}}</p> -->
      <p>
        <md-button @click="updateMeasurements">Update measurements</md-button>
      </p>
      <!-- <div class="md-toolbar-row">
        <md-tabs class="md-primary">
          <md-tab id="tab-home" md-label="Measurement history"></md-tab>
          <md-tab id="tab-pages" md-label="Forecast history"></md-tab>
        </md-tabs>
      </div>-->
      <router-view></router-view>
    </my-md-app-component>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Store from "../Store";
import { AirlyInstallationInfo } from "../airly/AirlyPull";
import { updateMeasurements } from "./../airly/AirlyMeasurementsGathering";
import MyMdAppComponent from "./MyMdApp.vue";
export default Vue.extend({
  data() {
    return {
      id: this.$route.params.id,
      info: {}
    };
  },
  created() {
    const id = this.$route.params.id;
    Store.Airly.installationById(id).then(info => {
      this.info = info;
    });
  },
  methods: {
    updateMeasurements() {
      updateMeasurements({ id: this.id });
    },
    toolbarTitle() {
      let title = "";
      if (this.id) {
        title += this.id;
      }
      if (this.info && (<any>this.info).address) {
        const { city, street, number } = (<any>this.info).address;
        title += `: ${city}, ${street} ${number}`;
      }
      return title;
    }
  },
  components: {
    MyMdAppComponent
  }
});
</script>
<style lang="scss" scoped>
.tabs {
  display: flex;
  flex-flow: row;
  justify-content: space-around;
  > * {
    flex-grow: 1;
    flex-wrap: nowrap;
    text-align: center;
    padding: 0.5em;
    background: rgb(79, 149, 170);
    color: #ffffff !important;
    text-decoration: none;
    &:hover {
      background: rgb(102, 192, 219);
    }
  }
}
</style>
