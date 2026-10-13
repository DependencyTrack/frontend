<template>
  <TheFooter>
    <div>
      <!-- left side here -->
    </div>
    <div class="ms-auto">
      <a href="#" role="button" @click.prevent="showAboutModal = true">{{
        dtrack.application
      }}</a
      >&nbsp;
      <span class="me-1">v{{ dtrack.version }}</span>
    </div>
    <about-modal v-model="showAboutModal" />
  </TheFooter>
</template>
<script>
import AboutModal from '../views/components/AboutModal.vue';
import { Footer as TheFooter } from '@coreui/vue';
import globalVarsMixin from '../mixins/globalVarsMixin';

export default {
  name: 'DefaultFooter',
  mixins: [globalVarsMixin],
  components: {
    AboutModal,
    TheFooter,
  },
  data() {
    return {
      showAboutModal: false,
    };
  },
};
</script>
<style scoped>
footer {
  flex: 0 0 24px;
  font-size: 85%;
}
</style>
