<template>
  <div class="animated fadeIn">
    <b-card :no-body="true" footer-class="px-3 py-2 card-footer-action">
      <b-card-body class="p-3 clearfix">
        <b-row>
          <b-col>
            <i class="fa fa-sitemap bg-primary p-3 font-2xl mr-3 float-left"></i>
            <div class="h5 text-primary mb-0 mt-2">Acme Application ▸ 1.0</div>
            <div class="text-muted text-uppercase font-weight-bold font-xs">
              <b-badge href="#" variant="secondary">java</b-badge>
              <b-badge href="#" variant="secondary">strategic</b-badge>
              <b-badge href="#" variant="secondary">external-facing</b-badge>
            </div>
          </b-col>
          <b-col>
            <severity-bar-chart ref="severityBarChart" chartId="severityBarChart" class="chart-wrapper float-right" style="width:100px;height:50px" width="100" height="50"/>
          </b-col>
        </b-row>
      </b-card-body>
      <div id="project-info-footer" slot="footer">
        <b-link class="font-weight-bold font-xs btn-block text-muted" href="#">View Details <i class="fa fa-angle-right float-right font-lg"></i></b-link>
      </div>
    </b-card>
    <b-tabs class="body-bg-color" style="border-left: 0; border-right:0; border-top:0 ">
      <b-tab class="body-bg-color overview-chart" style="border-left: 0; border-right:0; border-top:0 " active>
        <template v-slot:title><i class="fa fa-line-chart"></i> Overview</template>
        <project-dashboard style="border-left: 0; border-right:0; border-top:0 "/>
      </b-tab>
      <b-tab>
        <template v-slot:title><i class="fa fa-cubes"></i> Dependencies</template>
        Dependency table here
      </b-tab>
      <b-tab>
        <template v-slot:title><i class="fa fa-tasks"></i> Audit</template>
        Audit table here
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
  import Vue from 'vue'
  import api from "../../../shared/api";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import ProjectDashboard from "./ProjectDashboard";
  import SeverityBarChart from "../../dashboard/SeverityBarChart";
  import xssFilters from "xss-filters";
  import EventBus from '../../../shared/eventbus';

  export default {
    components: {
      SeverityBarChart,
      ProjectDashboard,
      PortfolioWidgetRow
    },
    mounted() {
      EventBus.$emit('addCrumb', 'Acme Application ▸ 1.0');
      //this.$refs.severityLineChart.render(response.data);
      this.$refs.severityBarChart.render();
    },
    destroyed() {
      EventBus.$emit('crumble');
    }
  };
</script>

<style scoped>
  .overview-chart {
    padding: 0;
  }
  .badge {
    margin-right: .4rem;
  }
</style>
