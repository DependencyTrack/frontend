<template>
  <figure
    v-for="severity in severities"
    :key="severity.name"
    v-b-tooltip.hover="severity.tooltip"
    class="text-center mb-0 me-3"
  >
    <progress-ring
      :bar-color="severity.color"
      font-size="14px"
      :track-color="trackColor"
      scale-color=""
      line-cap="round"
      :line-width="3"
      :percent="100"
      :size="50"
      >{{ severity.count }}</progress-ring
    >
    <figcaption class="font-xs text-muted">
      {{ $t(`severity.${severity.name}`) }}
    </figcaption>
  </figure>
</template>

<script>
import ProgressRing from './ProgressRing.vue';
import { themeColor } from '@/shared/theme';

export default {
  components: { ProgressRing },
  props: {
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    unassigned: Number,
  },
  computed: {
    severities() {
      const tooltips = {
        critical: this.$t('vulnerability.critical'),
        high: this.$t('vulnerability.high'),
        medium: this.$t('vulnerability.medium'),
        low: this.$t('vulnerability.low'),
        unassigned: this.$t('vulnerability.unassigned'),
      };
      return Object.entries(tooltips).map(([name, tooltip]) => ({
        name,
        count: this[name],
        color: themeColor(`--severity-${name}`),
        tooltip,
      }));
    },
    trackColor() {
      return themeColor('--dt-surface-recessed');
    },
  },
};
</script>
