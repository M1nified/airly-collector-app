<template>
  <md-app-drawer md-permanent="full">
    <md-toolbar class="md-transparent" md-elevation="0">Navigation</md-toolbar>

    <md-list>
      <md-list-item>
        <md-icon>home</md-icon>
        <span class="md-list-item-text">
          <router-link to="/sensors">Saved Installations</router-link>
        </span>
      </md-list-item>
    </md-list>
  </md-app-drawer>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({});
</script>

