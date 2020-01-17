import Vue from 'vue'
import axios from "axios";

export default {
  data () {
    return {
      configUrl: `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/`,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715'
      },
    }
  },
  methods: {
    updateConfigProperties: function(configProperties) {
      let promises = [];
      for (let i=0; i<configProperties.length; i++) {
        let prop = configProperties[i];
        let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/`;
        promises.push(
          this.axios.post(url, {
              groupName: prop.groupName,
              propertyName: prop.propertyName,
              propertyValue: prop.propertyValue
            }
          ));
      }
      this.axios.all(promises)
        .then((response) => {
          this.$toastr.s(this.$t('condition.successful'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
      });
    },
    updateConfigProperty: function(groupName, propertyName, propertyValue) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/`;
      this.axios.post(url, {
        groupName: groupName,
        propertyName: propertyName,
        propertyValue: propertyValue
      }).then((response) => {
        this.$toastr.s(this.$t('condition.successful'));
      }).catch((error) => {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      });
    }
  }
}
