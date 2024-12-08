import Vue from 'vue';
import axios from 'axios';
import EventBus from '@/shared/eventbus';

export default {
  data() {
    return {
      dtrack: Object,
      currentUser: Object,
    };
  },
  created() {
    if (this.$dtrack) {
      this.dtrack = this.$dtrack;
    } else {
      axios
        .get(`${app.config.globalProperties.$api.BASE_URL}/${app.config.globalProperties.$api.URL_ABOUT}`)
        .then((result) => {
          this.dtrack = result.data;
        });
    }
    if (this.$currentUser) {
      this.currentUser = this.$currentUser;
    } else {
      EventBus.$emit('profileUpdated');
    }
  },
  mounted() {
    EventBus.$on('profileUpdated', () => {
      axios
        .get(
          `${app.config.globalProperties.$api.BASE_URL}/${app.config.globalProperties.$api.URL_USER_SELF}`,
        )
        .then((result) => {
          this.currentUser = result.data;
        });
    });
  },
};
