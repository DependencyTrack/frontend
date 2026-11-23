<template>
  <div>
    <line-chart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script>
import '@/shared/chartTheme';
import { Line } from 'vue-chartjs';
import { hexToRgba } from '@/shared/utils';
import { themeColor } from '@/shared/theme';
import common from '../../shared/common';

export default {
  components: { LineChart: Line },
  data() {
    return {
      metrics: null,
    };
  },
  computed: {
    chartData() {
      const metrics = this.metrics;
      if (!metrics) {
        return null;
      }
      const widgetColor = themeColor('--dt-accent');
      let chartLabels = [];
      let chartData = [];
      for (let i = 0; i < metrics.length; i++) {
        chartLabels.push(metrics[i].firstOccurrence);
        chartData.push(metrics[i].vulnerableComponents);
      }

      const datasets = [
        {
          label: this.$t('message.components'),
          backgroundColor: hexToRgba(widgetColor, 10),
          fill: true,
          borderColor: widgetColor,
          pointHoverBackgroundColor: themeColor('--dt-surface-card'),
          data: chartData,
        },
      ];

      return {
        labels: chartLabels,
        datasets: datasets,
      };
    },
    options() {
      if (!this.chartData) {
        return null;
      }
      const { datasets } = this.chartData;
      return {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              labelColor: function (context) {
                return {
                  borderColor: context.dataset.borderColor,
                  backgroundColor: context.dataset.borderColor,
                };
              },
              title: function (tooltipItems) {
                const { chart, dataIndex } = tooltipItems[0];
                return common.formatTimestamp(
                  chart.data.labels[dataIndex],
                  true,
                );
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              font: {
                size: 2,
              },
              color: 'transparent',
            },
          },
          y: {
            display: false,
            min: 0,
            max: Math.max.apply(Math, datasets[0].data) + 5,
          },
        },
        elements: {
          line: {
            tension: 0.00001,
            borderWidth: 2,
          },
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
          },
        },
      };
    },
  },
  methods: {
    render: function (metrics) {
      this.metrics = metrics;
    },
  },
};
</script>
