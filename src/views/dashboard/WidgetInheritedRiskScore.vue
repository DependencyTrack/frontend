<template>
  <div>
    <line-chart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script>
import 'chart.js/auto';
import { Line } from 'vue-chartjs';
import common from '../../shared/common';
import { getStyle, hexToRgba } from '@/shared/utils';

export default {
  components: { LineChart: Line },
  data() {
    return {
      chartData: null,
      options: null,
    };
  },
  methods: {
    render: function (metrics) {
      const widgetColor = getStyle('--widget-4');
      let chartLabels = [];
      let chartData = [];
      for (let i = 0; i < metrics.length; i++) {
        chartLabels.push(metrics[i].firstOccurrence);
        chartData.push(metrics[i].inheritedRiskScore);
      }

      const datasets = [
        {
          label: this.$t('message.risk_score'),
          backgroundColor: hexToRgba(widgetColor, 10),
          fill: true,
          borderColor: widgetColor,
          pointHoverBackgroundColor: '#fff',
          data: chartData,
        },
      ];

      this.chartData = {
        labels: chartLabels,
        datasets: datasets,
      };
      this.options = {
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
};
</script>
