<template>
  <div class="animated fadeIn">
    <portfolio-widget-row />
  </div>
</template>

<script>
  import Vue from 'vue'
  import api from "../../../shared/api";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import SeverityProgressBar from "../../components/SeverityProgressBar";
  import xssFilters from "xss-filters";

  export default {
    components: {
      PortfolioWidgetRow
    }
  };
</script>
