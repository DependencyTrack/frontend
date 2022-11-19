import Vue from 'vue'
import axios from "axios";
import EventBus from "@/shared/eventbus";

export default {
  data () {
    return {
      dtrack: Object,
      currentUser: Object
    }
  },
  created() {
    if (this.$dtrack) {
      this.dtrack = this.$dtrack;
    } else {
      axios.get(`${Vue.prototype.$api.BASE_URL}/${Vue.prototype.$api.URL_ABOUT}`)
        .then((result) => {
            this.dtrack = result.data;
          }
        );
    }

    if(Vue.prototype.$api.API_NO_LOGIN) {
      this.currentUser = {
        "username": "admin",
        "lastPasswordChange": 1668810827129,
        "fullname": "Administrator",
        "email": "admin@localhost",
        "suspended": false,
        "forcePasswordChange": false,
        "nonExpiryPassword": true
      };
    } else if (this.$currentUser) {
      this.currentUser = this.$currentUser;
    } else {
      EventBus.$emit('profileUpdated');
    }
  },
  mounted() {
    EventBus.$on('profileUpdated', () => {
      if(!Vue.prototype.$api.API_NO_LOGIN) {
        axios.get(`${Vue.prototype.$api.BASE_URL}/${Vue.prototype.$api.URL_USER_SELF}`)
          .then((result) => {
              this.currentUser = result.data;
            }
          );
      }
    });
  }
}
