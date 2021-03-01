<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <b-tabs class="body-bg-color" style="border-left: 0; border-right:0; border-top:0 ">
      <b-tab class="body-bg-color overview-chart" style="border-left: 0; border-right:0; border-top:0 " active>
        <template v-slot:title>{{ $t('message.overview') }}</template>
        <table>
          <tr>
            <td class="heading">{{ $t('message.license_name') }}:</td>
            <td>{{ license.name }}</td>
          </tr>
          <tr>
            <td class="heading">{{ $t('message.spdx_license_id') }}:</td>
            <td>{{ license.licenseId }}</td>
          </tr>
          <tr>
            <td class="heading">{{ $t('message.osi_approved') }}:</td>
            <td>
              <span v-if="license.isOsiApproved"><i class="fa fa-check-square-o" /></span>
              <span v-else><i class="fa fa-square-o" /></span>
            </td>
          </tr>
          <tr>
            <td class="heading">{{ $t('message.fsf_libre') }}:</td>
            <td>
              <span v-if="license.isFsfLibre"><i class="fa fa-check-square-o" /></span>
              <span v-else><i class="fa fa-square-o" /></span>
            </td>
          </tr>
          <tr>
            <td class="heading">{{ $t('message.deprecated') }}:</td>
            <td>
              <span v-if="license.isDeprecatedLicenseId"><i class="fa fa-check-square-o" /></span>
              <span v-else><i class="fa fa-square-o" /></span>
            </td>
          </tr>
          <tr>
            <td class="heading">{{ $t('message.comments') }}:</td>
            <td>{{ license.licenseComments }}</td>
          </tr>
          <tr>
            <td></td>
            <td><img v-if="license.isOsiApproved" src="@/assets/img//osi-logo.svg" alt="OSI logo" width="80"></td>
          </tr>
        </table>
      </b-tab>
      <b-tab>
        <template v-slot:title>{{ $t('message.license_text') }}</template>
        <div class="licenseText formattedLicenseContent">{{ license.licenseText }}</div>
      </b-tab>
      <b-tab>
        <template v-slot:title>{{ $t('message.template') }}</template>
        <div class="templateText formattedLicenseContent">{{ license.standardLicenseTemplate }}</div>
      </b-tab>
      <b-tab>
        <template v-slot:title>{{ $t('message.source_header') }}</template>
        <div class="headerText formattedLicenseContent">{{ license.standardLicenseHeader }}</div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
  import common from "../../../shared/common"
  import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities'
  import EventBus from '../../../shared/eventbus';
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    mixins: [permissionsMixin],
    components: {
    },
    title: '',
    computed: {
      licenseLabel () {
        if (this.license.name) {
          return this.license.name;
        } else {
          return this.license.licenseId;
        }
      }
    },
    data() {
      return {
        licenseId: null,
        license: {}
      }
    },
    methods: {
      getStyle: function(style) {
        return getStyle(style);
      }
    },
    beforeMount() {
      this.licenseId = this.$route.params.licenseId;
    },
    mounted() {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE}/${this.licenseId}`;
      this.axios.get(url).then((response) => {
        this.license = response.data;
        EventBus.$emit('addCrumb', this.licenseLabel);
        this.$title = `${this.$t('message.license')} ${this.licenseLabel}`;
      });
    },
    destroyed() {
      EventBus.$emit('crumble');
    }
  }
</script>

<style lang="scss" scoped>
  th, td {
    padding: 8px;
    text-align: left;
    vertical-align: text-top;
  }
  .heading {
    font-weight: bold;
    white-space: nowrap;
  }
  .fa-check-square-o {
    color: var(--primary);
  }
  .fa-square-o {
    color: var(--secondary);
  }
</style>
