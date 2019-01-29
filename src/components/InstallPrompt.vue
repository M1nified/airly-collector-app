<template>
  <div class="install-bar" v-if="showInstallButton">
    <button @click="clickInstall">Install Airly Collector</button>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    let deferredPrompt: null | {} = null;
    return {
      showInstallButton: false,
      deferredPrompt
    };
  },
  created() {
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
    }
  }
});
</script>
<style lang="scss" scoped>
</style>

