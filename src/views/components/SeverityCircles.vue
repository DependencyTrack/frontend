<template>
  <figure
    v-for="severity in severities"
    :key="severity.name"
    class="text-center mb-0 me-3"
  >
    <vue-easy-pie-chart
      :bar-color="severity.color"
      font-size="14px"
      :track-color="trackColor"
      scale-color=""
      line-cap="round"
      :line-width="3"
      :percent="100"
      :size="50"
      :animate="true"
      >{{ severity.count }}</vue-easy-pie-chart
    >
    <figcaption class="font-xs text-muted">
      {{ $t(`severity.${severity.name}`) }}
    </figcaption>
  </figure>
</template>

<script>
import VueEasyPieChart from './VueEasyPieChart.vue';
import { themeColor } from '@/shared/theme';

export default {
  components: { VueEasyPieChart },
  props: {
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    unassigned: Number,
  },
  computed: {
    severities() {
      return ['critical', 'high', 'medium', 'low', 'unassigned'].map(
        (name) => ({
          name,
          count: this[name],
          color: themeColor(`--severity-${name}`),
        }),
      );
    },
    trackColor() {
      return themeColor('--dt-surface-recessed');
    },
  },
};
</script>
