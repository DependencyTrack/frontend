<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.POLICY_MANAGEMENT">
    <b-tabs
      class="body-bg-color"
      style="border-left: 0; border-right: 0; border-top: 0"
    >
      <b-tab
        ref="policies"
        class="body-bg-color overview-chart"
        style="border-left: 0; border-right: 0; border-top: 0"
        active
        @click="routeTo()"
      >
        <template #title
          ><i class="fa fa-list-alt"></i> {{ $t('message.policies') }}
          <b-badge variant="tab-total">{{ totalPolicies }}</b-badge></template
        >
        <policy-list @total="totalPolicies = $event" />
      </b-tab>
      <b-tab ref="licensegroups" @click="routeTo('licenseGroups')">
        <template #title
          ><i class="fa fa-balance-scale"></i>
          {{ $t('message.license_groups') }}
          <b-badge variant="tab-total">{{
            totalLicenseGroups
          }}</b-badge></template
        >
        <license-group-list @total="totalLicenseGroups = $event" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import permissionsMixin from '@/mixins/permissionsMixin';
import PolicyList from './PolicyList';
import LicenseGroupList from './LicenseGroupList';
import { BBadge, BTab, BTabs } from 'bootstrap-vue';

export default {
  components: {
    LicenseGroupList,
    PolicyList,
    BTabs,
    BTab,
    BBadge,
  },
  mixins: [permissionsMixin],
  data() {
    return {
      totalPolicies: 0,
      totalLicenseGroups: 0,
    };
  },
  watch: {
    $route() {
      this.getTabFromRoute().activate();
    },
  },
  mounted() {
    this.getTabFromRoute().active = true;
  },
  methods: {
    routeTo(path) {
      if (path) {
        if (
          !this.$route.fullPath.toLowerCase().includes('/' + path.toLowerCase())
        ) {
          this.$router.push({ path: '/policy/' + path });
        }
      } else if (
        this.$route.fullPath !== '/policy' &&
        this.$route.fullPath !== '/policy/'
      ) {
        this.$router.push({ path: '/policy' });
      }
    },
    getTabFromRoute: function () {
      const pattern = new RegExp('/policy\/([^\\/]*)', 'gi');
      const tab = pattern.exec(this.$route.fullPath.toLowerCase());
      return this.$refs[tab && tab[1] ? tab[1].toLowerCase() : 'policies'];
    },
  },
};
</script>
