import common from '../../../shared/common';

export default {
  data() {
    return {
      configUrl: `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/`,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
    };
  },
  methods: {
    updateConfigProperties: function (configProperties) {
      let props = [];
      for (let i = 0; i < configProperties.length; i++) {
        let prop = configProperties[i];
        prop.propertyValue = common.trimToNull(prop.propertyValue);
        props.push(prop);
      }
      let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/aggregate`;
      return this.axios
        .post(url, props)
        .then((response) => {
          let errors = response.data.filter((item) => typeof item === 'string');
          if (errors.length > 0) {
            errors.forEach((error) => this.$toastr.w(error));
            return false;
          } else {
            this.$toastr.s(this.$t('admin.configuration_saved'));
            return true;
          }
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
          return false;
        });
    },
    /*
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
     */
    updateConfigProperty: function (groupName, propertyName, propertyValue) {
      propertyValue = common.trimToNull(propertyValue);
      let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/`;
      this.axios
        .post(url, {
          groupName: groupName,
          propertyName: propertyName,
          propertyValue: propertyValue,
        })
        .then(() => {
          this.$toastr.s(this.$t('admin.configuration_saved'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
};
