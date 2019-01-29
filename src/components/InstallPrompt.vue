<template>
  <md-toolbar class="md-accent md-gutter" v-if="showInstallButton && !installButtonDiscarded">
    <md-button class="md-raised md-primary" @click="clickInstall">Install</md-button>
    <md-button class="md-icon-button btn-discard" @click="clickDiscard">
      <md-icon>close</md-icon>
    </md-button>
  </md-toolbar>
</template>
<script lang="ts">
import Vue from "vue";
import Store from "./../Store";
export default Vue.extend({
  data() {
    let deferredPrompt: null | {} = null;
    return {
      showInstallButton: false,
      installButtonDiscarded: true,
      deferredPrompt
    };
  },
  async created() {
    this.installButtonDiscarded = !!(await Store.Settings.setting(
      "installButtonDiscarded"
    ));
    window.addEventListener("beforeinstallprompt", e => {
      console.info("beforeinstallprompt");
      e.preventDefault();
      this.deferredPrompt = <any>e;
      this.showInstallButton = true;
    });
  },
  methods: {
    async clickInstall() {
      this.showInstallButton = false;
      (<any>this.deferredPrompt).prompt();
      const choiceResult = (<any>this.deferredPrompt).userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("accepted");
      } else {
        console.log("rejected");
      }
      this.deferredPrompt = null;
    },
    async clickDiscard() {
      this.installButtonDiscarded = true;
      await Store.Settings.setting("installButtonDiscarded", true);
    }
  }
});
</script>
<style lang="scss" scoped>
.btn-discard {
  margin-left: auto;
  margin-right: 0;
}
</style>

