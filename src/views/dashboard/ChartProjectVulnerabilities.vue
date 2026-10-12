<template>
  <div>
    <line-chart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script>
import 'chart.js/auto';
import common from '../../shared/common';
import { Line } from 'vue-chartjs';
import { getStyle, hexToRgba } from '@/shared/utils';

export default {
  components: { LineChart: Line },
  data() {
    return {
      chartData: null,
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            intersect: true,
            mode: 'index',
            position: 'nearest',
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
              drawOnChartArea: false,
            },
            ticks: {
              callback: function (value) {
                return common.formatTimestamp(this.getLabelForValue(value));
              },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 2,
            },
          },
        },
        elements: {
          line: {
            tension: 0.1,
            borderWidth: 2,
          },
          point: {
            radius: 0,
            hitRadius: 20,
            hoverRadius: 4,
            hoverBorderWidth: 3,
          },
        },
      },
    };
  },
  methods: {
    render: function (metrics) {
      const totalStyle = getStyle('--notification-note');
      const affectedStyle = getStyle('--notification-warn');
      const nonAffectedStyle = getStyle('--notification-pass');

      let labels = [];
      let totalData = [];
      let affectedData = [];
      let nonAffectedData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        totalData.push(metrics[i].projects);
        affectedData.push(metrics[i].vulnerableProjects);
        nonAffectedData.push(
          metrics[i].projects - metrics[i].vulnerableProjects,
        );

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          totalData.push(metrics[i].projects);
          affectedData.push(metrics[i].vulnerableProjects);
          nonAffectedData.push(
            metrics[i].projects - metrics[i].vulnerableProjects,
          );
        }
      }

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: this.$t('message.total'),
            backgroundColor: 'transparent',
            borderColor: totalStyle,
            pointHoverBackgroundColor: '#fff',
            data: totalData,
          },
          {
            label: this.$t('message.non_vulnerable'),
            backgroundColor: hexToRgba(nonAffectedStyle, 10),
            fill: true,
            borderColor: nonAffectedStyle,
            pointHoverBackgroundColor: '#fff',
            data: nonAffectedData,
          },
          {
            label: this.$t('message.vulnerable'),
            backgroundColor: hexToRgba(affectedStyle, 10),
            fill: true,
            borderColor: affectedStyle,
            pointHoverBackgroundColor: '#fff',
            data: affectedData,
          },
        ],
      };
    },
  },
};
</script>
