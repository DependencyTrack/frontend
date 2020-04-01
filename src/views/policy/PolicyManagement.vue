<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.POLICY_MANAGEMENT">
    <b-tabs class="body-bg-color" style="border-left: 0; border-right:0; border-top:0 ">
      <b-tab class="body-bg-color overview-chart" style="border-left: 0; border-right:0; border-top:0 " active>
        <template v-slot:title><i class="fa fa-list-alt"></i> {{ $t('message.policies') }} <b-badge variant="tab-total">{{ totalPolicies }}</b-badge></template>
        <policy-list v-on:total="totalPolicies = $event" />
      </b-tab>
      <b-tab>
        <template v-slot:title><i class="fa fa-balance-scale"></i> {{ $t('message.license_groups') }} <b-badge variant="tab-total">{{ totalLicenseGroups }}</b-badge></template>
        <license-group-list v-on:total="totalLicenseGroups = $event" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
  import permissionsMixin from "../../mixins/permissionsMixin";
  import PolicyList from "./PolicyList";
  import LicenseGroupList from "./LicenseGroupList";

  export default {
    mixins: [permissionsMixin],
    components: {
      LicenseGroupList,
      PolicyList
    },
    data() {
      return {
        totalPolicies: 0,
        totalLicenseGroups: 0
      }
    }
  }
</script>
