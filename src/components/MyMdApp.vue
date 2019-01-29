<template>
  <md-app>
    <md-app-toolbar class="md-primary md-dense">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
            <md-icon>menu</md-icon>
          </md-button>
          <span class="md-display-1">{{toolbarTitle || ``}}</span>
        </div>
        <div class="md-toolbar-section-end">
          <!-- <md-button class="md-icon-button">
            <md-icon>more_vert</md-icon>
          </md-button>-->
        </div>
      </div>
    </md-app-toolbar>
    <md-app-drawer :md-active.sync="menuVisible">
      <md-toolbar class="md-transparent" md-elevation="0">
        <span class="md-title">Airly Collector</span>
      </md-toolbar>
      <md-list>
        <md-list-item>
          <md-icon>home</md-icon>
          <span class="md-list-item-text">
            <router-link to="/sensors">Your Installations</router-link>
          </span>
        </md-list-item>
        <md-list-item>
          <md-icon>settings</md-icon>
          <span class="md-list-item-text">
            <router-link to="/settings">Settings</router-link>
          </span>
        </md-list-item>
      </md-list>
    </md-app-drawer>
    <slot name></slot>
    <md-app-content>
      <slot>Empty</slot>
    </md-app-content>
  </md-app>
</template>
<script lang="ts">
import Vue from "vue";
// import MyMdAppDrawerComponent from "./MyMdAppDrawer.vue";
export default Vue.extend({
  props: ["toolbarTitle"],
  data() {
    return {
      menuVisible: false
    };
  },
  components: {
    // MyMdAppDrawerComponent
  }
});
</script>
<style lang="scss" scoped>
.md-drawer {
  width: 230px;
  max-width: calc(100vw - 125px);
}
.md-app {
  min-height: 100vh;
}
</style>

