<template>
  <div>
    <md-dialog :md-active.sync="installationAddDialogActive">
      <md-dialog-title>Add Installation</md-dialog-title>
      <md-dialog-content>
        <form novalidate class="md-layout" @submit.prevent="installationAddDialogSubmit">
          <md-field>
            <label>Installation Id</label>
            <md-input v-model="installationAddInstance.id"></md-input>
          </md-field>
        </form>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="installationAddDialogActive = false">Close</md-button>
        <md-button class="md-primary" @click="installationAddDialogSubmit">Save</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-dialog-confirm
      :md-active.sync="installationRemoveDialogActive"
      md-title="Remove Installation?"
      md-content="This can not be undone."
      md-confirm-text="Remove"
      md-cancel-text="Cancel"
      @md-cancel="installationRemoveDialogOnCancel"
      @md-confirm="installationRemoveDialogOnConfirm"
      md-backdrop
    />

    <div v-if="sensorToEdit && !sensorToEdit.saved">
      <edit-sensor-component v-model="sensorToEdit" v-bind:onsave="editSensorOnSave"/>
    </div>
    <div class="md-layout md-alignment-center-left">
      <div class="md-layout-item">
        <md-field>
          <label>ApiKey</label>
          <md-input v-model="apiKey"></md-input>
          <!-- <input class="md-input" v-model="apiKey"> -->
        </md-field>
      </div>
      <div class="md-layout-item">
        <md-button md-direction="right" @click="saveApiKey">save
          <!-- <i class="material-icons">save</i> -->
        </md-button>
      </div>
    </div>
    <table class="installations-table">
      <thead>
        <tr>
          <th>Id</th>
          <th>City</th>
          <th>Address</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(sensor) in sensors" :key="sensor.id">
          <td class="installation-id">{{sensor.id}}</td>
          <td>{{sensor.info && sensor.info.address.city}}</td>
          <td>{{sensor.info && (({city, street, number}) => `${street} ${number}`)(sensor.info.address)}}</td>
          <td>
            <md-button class="md-icon-button" @click="removeSensor(sensor.id)">
              <md-icon>delete</md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="goToInstallation(sensor.id)">
              <md-icon>view_list</md-icon>
            </md-button>
          </td>
        </tr>
      </tbody>
    </table>
    <md-button
      class="md-icon-button md-fab md-fixed md-fab-bottom-right"
      @click="installationAddStart"
    >
      <md-icon>add</md-icon>
    </md-button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Store from "../Store";
import EditSensorComponent from "./EditSensor.vue";

interface NewInstallationTemplate {
  id?: number | string;
  location?: {
    latitude?: number | string;
    longitude?: number | string;
  };
}
const newInstallationTemplate: NewInstallationTemplate = {
  id: undefined,
  location: {
    latitude: undefined,
    longitude: undefined
  }
};

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
      apiKey,
      installationRemoveDialogActive: false,
      installationAddDialogActive: false,
      installationAddInstance: { ...newInstallationTemplate }
    };
  },
  async created() {
    await this.installationsGetInfo();
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
    save() {},
    saveInstallations() {
      const ids = this.sensors.map(({ id }) => id),
        json = JSON.stringify(ids);
      localStorage.setItem("sensorIds", json);
    },
    saveApiKey() {
      console.log(this.apiKey);
      if (typeof this.apiKey === "string")
        localStorage.setItem("apiKey", this.apiKey);
    },
    removeSensor(sensorId: number) {
      this.installationRemoveDialogActive = true;
      this.installationRemoveFinalize = () => {
        const index = this.sensors.findIndex(({ id }) => id === sensorId),
          removed = this.sensors.splice(index, 1);
        console.info(`Removed`, removed);
        this.saveInstallations();
      };
    },
    log(sensor: any) {
      console.log(this.i, sensor);
    },
    goToInstallation(installationId: number) {
      this.$router.push(`/sensor/${installationId}`);
    },
    installationRemoveFinalize() {},
    installationRemoveDialogOnCancel() {},
    installationRemoveDialogOnConfirm() {
      this.installationRemoveFinalize();
      this.installationRemoveFinalize = () => {};
    },
    installationAddStart() {
      this.installationAddInstance = { ...newInstallationTemplate };
      this.installationAddDialogActive = true;
    },
    async installationAddDialogSubmit() {
      console.log("submit");
      this.installationAddDialogActive = false;
      console.log(this.installationAddInstance);
      let appended = false;
      if (this.installationAddInstance) {
        if ("id" in this.installationAddInstance) {
          const { id } = this.installationAddInstance;
          const newInstallation = { id: id && parseInt(id.toString()) };
          this.sensors.push(newInstallation);
          appended = true;
        }
      }
      if (appended) {
        await this.installationsGetInfo();
        this.saveInstallations();
      }
      console.log("submited");
    },
    async installationsGetInfo() {
      this.sensors = await Promise.all(
        this.sensors.map(async installation => {
          try {
            const info = await Store.Airly.installationById(installation.id);
            return {
              ...installation,
              info
            };
          } catch (ex) {
            return {
              ...installation
            };
          }
        })
      );
    }
  },
  watch: {},
  computed: {},
  components: {
    EditSensorComponent
  }
});
</script>

<style lang="scss" scoped>
.installations-table {
  th {
    text-align: center;
  }
  td.installation-id {
    text-align: right;
  }
}
.md-dialog {
  max-width: 768px;
}
</style>
