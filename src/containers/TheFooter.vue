<template>
  <CFooter :fixed="true">
    <div>
      <!-- left side here -->
    </div>
    <div class="mfs-auto">
      <a href="#" v-b-modal.aboutModal >{{ dtrack.application }}</a>&nbsp;
      <span class="mr-1">v{{ dtrack.version }}</span>
    </div>
    <about-modal />
  </CFooter>
</template>

<script>
import globalVarsMixin from "../mixins/globalVarsMixin";
import AboutModal from "../views/components/AboutModal";

export default {
  name: 'TheFooter',
  mixins: [globalVarsMixin],
  components: {
    AboutModal
  },
}
</script>
<style scoped>
  footer {
    flex: 0 0 24px;
    font-size: 85%;
  }
</style>
