<template>
  <div>
    <p>Installation Id: {{id}}</p>
    <p
      class="info-location"
    >{{info.location && `${info.location.latitude}, ${info.location.longitude}`}}</p>
    <p class="info-address">{{info.address && `${info.address.country}, ${info.address.city}`}}</p>
    <p class="info-sponsor">{{info.sponsor && info.sponsor.name}}</p>
    <p>
      <button @click="updateMeasurements">Update measurements</button>
    </p>
    <div class="tabs">
      <router-link v-bind:to="`/sensor/${id}/history`">Measurement history</router-link>
      <router-link v-bind:to="`/sensor/${id}/forecast`">Forecast history</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Store from "../Store";
import { AirlyInstallationInfo } from "../airly/AirlyPull";
import { updateMeasurements } from "./../airly/AirlyMeasurementsGathering";
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
    }
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
