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
        .get(`${Vue.prototype.$api.BASE_URL}/${Vue.prototype.$api.URL_ABOUT}`)
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
          `${Vue.prototype.$api.BASE_URL}/${Vue.prototype.$api.URL_USER_SELF}`,
        )
        .then((result) => {
          this.currentUser = result.data;
        });
    });
  },
};
