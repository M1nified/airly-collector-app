<template>
  <div>
    <h1>HOME</h1>
    <div v-if="sensorToEdit && !sensorToEdit.saved">
      <edit-sensor-component v-model="sensorToEdit" v-bind:onsave="editSensorOnSave"/>
    </div>
    <ul>
      <li v-for="(sensor) in sensors" :key="sensor.id">
        <router-link v-bind:to="`/sensor/${sensor.id}`">{{sensor.id}}</router-link>
        <button class="mdc-button" @click="removeSensor(sensor.id)">remove</button>
      </li>
    </ul>
    <input v-model="apiKey">
    <button class="mdc-button" @click="addSensor">
      <i class="material-icons">add</i>
    </button>
    <button class="mdc-button" @click="save">
      <i class="material-icons">save</i>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import EditSensorComponent from "./EditSensor.vue";

export default Vue.extend({
  props: [],
  data() {
    const sensorsJson = localStorage.getItem("sensorIds"),
      sensors: any[] = sensorsJson
        ? JSON.parse(sensorsJson).map((id: string | number) => ({
            id: id && parseInt(id.toString())
          }))
        : [];
    const apiKey = localStorage.getItem("apiKey");
    const sensorToEdit: any = undefined;
    console.log(sensors);
    return {
      sensorToEdit,
      sensors,
      i: 0,
      apiKey
    };
  },
  methods: {
    addSensor() {
      const last = this.sensors[this.sensors.length - 1];
      const newSensor = { id: 0, editable: true };
      // this.sensors.push(newSensor);
      this.sensorToEdit = newSensor;
    },
    editSensorOnSave(sensor: any) {
      console.log("editSensorOnSave");
      console.log(sensor);
      this.sensorToEdit = sensor;
      this.sensorToEdit = {};
      this.sensors.push(sensor);
    },
    save() {
      const ids = this.sensors.map(({ id }) => id),
        json = JSON.stringify(ids);
      localStorage.setItem("sensorIds", json);
      console.log(this.apiKey);
      if (typeof this.apiKey === "string")
        localStorage.setItem("apiKey", this.apiKey);
    },
    removeSensor(sensorId: number) {
      const index = this.sensors.findIndex(({ id }) => id === sensorId),
        removed = this.sensors.splice(index, 1);
      console.info(`Removed`, removed);
    },
    log(sensor: any) {
      console.log(this.i, sensor);
    }
  },
  computed: {},
  components: {
    EditSensorComponent
  }
});
</script>

<style scoped>
</style>
