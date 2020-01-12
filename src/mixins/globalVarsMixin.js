import Vue from 'vue'
import axios from "axios";

export default {
  data () {
    return {
      dtrack: Object
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
  }
}
