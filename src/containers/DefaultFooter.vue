<template>
  <footer class="app-footer">
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
  </footer>
</template>
<script>
import AboutModal from '../views/components/AboutModal.vue';
import state from '../shared/state';

export default {
  name: 'DefaultFooter',
  components: {
    AboutModal,
  },
  data() {
    return {
      showAboutModal: false,
    };
  },
  computed: {
    dtrack: () => state.dtrack,
  },
};
</script>
<style scoped>
footer {
  flex: 0 0 24px;
  font-size: 85%;
}
</style>
