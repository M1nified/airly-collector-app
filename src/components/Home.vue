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
    <my-md-app-component toolbar-title="Installations">
      <div v-if="sensorToEdit && !sensorToEdit.saved">
        <edit-sensor-component v-model="sensorToEdit" v-bind:onsave="editSensorOnSave"/>
      </div>
      <md-card>
        <md-table class="installations-table" v-model="sensors" md-sort="id" md-sort-order="asc">
          <md-table-row>
            <md-table-head>Id</md-table-head>
            <md-table-head>City</md-table-head>
            <md-table-head>Address</md-table-head>
            <md-table-head>Last Update</md-table-head>
          </md-table-row>
          <md-table-row v-for="(sensor) in sensors" :key="sensor.id">
            <md-table-cell class="installation-id">{{sensor.id}}</md-table-cell>
            <md-table-cell>{{sensor.info && sensor.info.address.city}}</md-table-cell>
            <md-table-cell>{{sensor.info && (({city, street, number}) => `${street} ${number}`)(sensor.info.address)}}</md-table-cell>
            <md-table-cell>
              <span v-if="sensor.updatedAt.diff.days > 1">{{sensor.updatedAt.diff.days}} days ago</span>
              <span
                v-else-if="sensor.updatedAt.diff.days > 0"
              >{{sensor.updatedAt.diff.days}} day ago</span>
              <span
                v-else-if="sensor.updatedAt.diff.hours > 1"
              >{{sensor.updatedAt.diff.hours}} hours ago</span>
              <span
                v-else-if="sensor.updatedAt.diff.hours > 0"
              >{{sensor.updatedAt.diff.hours}} hour ago</span>
              <span
                v-else-if="sensor.updatedAt.diff.minutes > 1"
              >{{sensor.updatedAt.diff.minutes}} minutes ago</span>
              <span
                v-else-if="sensor.updatedAt.diff.minutes > 0"
              >{{sensor.updatedAt.diff.minutes}} minute ago</span>
              <span
                v-else-if="sensor.updatedAt.diff.seconds > 1"
              >{{sensor.updatedAt.diff.seconds}} seconds ago</span>
              <span
                v-else-if="sensor.updatedAt.diff.seconds > 0"
              >{{sensor.updatedAt.diff.seconds}} second ago</span>
              <span v-else-if="sensor.updatedAt.diff.milliseconds > 0">Now</span>
              <span v-else>Never</span>
              <md-tooltip
                md-direction="top"
              >{{`${sensor.updatedAt.date.toLocaleDateString()} ${sensor.updatedAt.date.toLocaleTimeString()}`}}</md-tooltip>
            </md-table-cell>
            <md-table-cell>
              <md-button class="md-icon-button" @click="removeSensor(sensor.id)">
                <md-icon>delete</md-icon>
                <md-tooltip md-direction="top">Remove installation</md-tooltip>
              </md-button>
              <md-button class="md-icon-button" @click="goToInstallation(sensor.id)">
                <md-icon>folder_open</md-icon>
                <md-tooltip md-direction="top">Go to measurements</md-tooltip>
              </md-button>
              <md-button class="md-icon-button" @click="updateMeasurements(sensor.id)">
                <md-icon>cached</md-icon>
                <md-tooltip md-direction="top">Update</md-tooltip>
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-card>
      <md-card>
        <md-card-header>
          <div class="md-title">Global actions</div>
        </md-card-header>
        <md-card-content>
          <md-button class="md-raised md-primary" @click="updateAllMeasurements">
            <md-icon>cached</md-icon>&nbsp;Update all
          </md-button>
        </md-card-content>
      </md-card>
    </my-md-app-component>
    <md-button
      class="md-icon-button md-fab md-fixed md-fab-bottom-right"
      @click="installationAddStart"
    >
      <md-icon>add</md-icon>
      <md-tooltip md-direction="left">Add new installation</md-tooltip>
    </md-button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Store from "../Store";
import MyMdAppComponent from "./MyMdApp.vue";
import { updateMeasurements } from "./../airly/AirlyMeasurementsGathering";
import { makeTimeObject } from "./../time";
import { App as AppUpdate } from "./../autoupdate";

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
    const sensors: any[] = [];
    const apiKey = localStorage.getItem("apiKey");
    const sensorToEdit: any = undefined;
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
    AppUpdate.subscribeFor("autoupdateAll", () => {
      console.log("sub dne");
      this.installationsGetInfo();
    });
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
    async saveInstallations() {
      const installations = this.sensors.map(({ id }) => ({ id }));
      return await Store.Settings.setting("installations", installations);
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
        await this.saveInstallations();
        await this.installationsGetInfo();
      }
      console.log("submited");
    },
    async installationsGetInfo() {
      const currentTime = new Date(Date.now());
      const installations: any[] =
        (await Store.Settings.setting("installations")) || [];
      this.sensors = await Promise.all(
        installations.map(async installation => {
          try {
            const info = await Store.Airly.installationById(installation.id);
            const updatedAt = makeTimeObject(
              (await Store.Airly.historyUpdateDateTime({
                id: installation.id
              })).updateDateTime,
              currentTime
            );
            return {
              ...installation,
              info,
              updatedAt
            };
          } catch (ex) {
            return {
              ...installation
            };
          }
        })
      );
      return true;
    },
    async updateMeasurements(installationId: number) {
      await updateMeasurements({ id: installationId });
      this.installationsGetInfo();
    },
    async updateAllMeasurements() {
      await AppUpdate.castAutoupdateAll();
    }
  },
  watch: {},
  computed: {},
  components: {
    MyMdAppComponent
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
.md-card {
  margin: 4px;
  vertical-align: top;
}
</style>
