<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row :fetch="true" />
  </div>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    mixins: [permissionsMixin],
    components: {
      cSwitch,
      PortfolioWidgetRow
    },
    methods: {
    },
    data() {
      return {
        data: [],
      };
    }
  };
</script>
