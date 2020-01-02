<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row />
  </div>
</template>

<script>
  import Vue from 'vue'
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import SeverityProgressBar from "../../components/SeverityProgressBar";
  import xssFilters from "xss-filters";
  import EventBus from '../../../shared/eventbus';

  export default {
    components: {
      PortfolioWidgetRow
    },
    mounted() {
      EventBus.$emit('addCrumb', 'Apache Struts 2.0.0');
    },
    destroyed() {
      EventBus.$emit('crumble');
    }
  };
</script>
