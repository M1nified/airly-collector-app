<template>
  <div>
    <my-md-app-component toolbar-title="Settings">
      <md-card>
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Airly API</div>
            <!-- <div class="md-subhead">Subtitle here</div> -->
          </md-card-header-text>
          <md-card-expand-trigger>
            <md-button class="md-icon-button">
              <md-icon>info</md-icon>
            </md-button>
          </md-card-expand-trigger>
        </md-card-header>
        <md-card-content>
          <md-field>
            <label>API Key</label>
            <md-input v-model="apiKey"></md-input>
          </md-field>
        </md-card-content>
        <md-card-expand>
          <md-card-expand-content>
            <md-card-content>
              API Key can be obtained by visiting and registering at https://developer.airly.eu/api
              <a
                href="https://developer.airly.eu/api"
                target="_blank"
              >
                <md-icon class>open_in_new</md-icon>
              </a>
            </md-card-content>
          </md-card-expand-content>
        </md-card-expand>
      </md-card>
      <md-card>
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Autoupdate</div>
            <!-- <div class="md-subhead">Subtitle here</div> -->
          </md-card-header-text>
        </md-card-header>
        <md-card-content>
          <div class="input">
            <md-switch v-model="autoupdateAll">Update all installations automatically</md-switch>
          </div>
        </md-card-content>
      </md-card>
    </my-md-app-component>

    <md-button class="md-icon-button md-fab md-fixed md-fab-bottom-right" @click="settingsSave">
      <md-icon>save</md-icon>
    </md-button>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import MyMdAppComponent from "./MyMdApp.vue";
import Store from "./../Store";
export default Vue.extend({
  data() {
    return {
      autoupdateAll: false,
      apiKey: ""
    };
  },
  async created() {
    const autoupdateAll = await Store.Settings.setting("autoupdateAll");
    const apiKey = await Store.Settings.setting("apiKey");
    console.log(autoupdateAll, apiKey);
    this.autoupdateAll = autoupdateAll || false;
    this.apiKey = apiKey || "";
  },
  methods: {
    async settingsSave() {
      await Promise.all([
        Store.Settings.setting("autoupdateAll", this.autoupdateAll),
        Store.Settings.setting("apiKey", this.apiKey)
      ]);
    }
  },
  components: {
    MyMdAppComponent
  }
});
</script>
<style lang="scss" scoped>
.md-card {
  margin: 4px;
  vertical-align: top;
}
</style>
