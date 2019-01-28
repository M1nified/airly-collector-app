<template>
  <div v-if="active">
    <input placeholder="Sensor Id" v-model="sensor.id">
    <button class="mdc-button" @click="save">
      <i class="material-icons">submit</i>
    </button>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.component("edit-sensor-component", {
  props: ["value", "onsave"],
  data() {
    return {
      sensor: this.value,
      active: true
    };
  },
  methods: {
    save() {
      this.active = false;
      console.log(this.sensor.id);
      this.$emit("sensorToEdit", this.sensor);
      this.onsave(this.sensor);
    }
  }
});
</script>
