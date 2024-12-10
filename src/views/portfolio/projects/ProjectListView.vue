<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row :fetch="true" />
    <project-list></project-list>
  </div>
</template>

<script>
import PortfolioWidgetRow from '@/views/dashboard/PortfolioWidgetRow.vue';
import ProjectList from '@/views/portfolio/projects/ProjectList.vue';

export default {
  components: { ProjectList, PortfolioWidgetRow },
};
</script>
