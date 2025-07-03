<template>
  <TheFooter>
    <div>
      <!-- left side here -->
    </div>
    <div class="ml-auto">
      <a href="#" v-b-modal.aboutModal>{{ dtrack.application }}</a
      >&nbsp;
      <span class="mr-1">v{{ dtrack.version }}</span>
    </div>
    <about-modal />
  </TheFooter>
</template>
<script>
import AboutModal from '@/views/components/AboutModal';
import { Footer as TheFooter } from '@coreui/vue';
import globalVarsMixin from '@/mixins/globalVarsMixin';

export default {
  components: {
    AboutModal,
    TheFooter,
  },
  mixins: [globalVarsMixin],
};
</script>
<style scoped>
footer {
  flex: 0 0 24px;
  font-size: 85%;
}
</style>
