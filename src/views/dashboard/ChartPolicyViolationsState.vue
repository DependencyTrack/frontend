<template>
  <div>
    <line-chart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script>
import 'chart.js/auto';
import common from '../../shared/common';
import { Line } from 'vue-chartjs';
import { getStyle } from '@/shared/utils';

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
      const failStyle = getStyle('--notification-fail');
      const warnStyle = getStyle('--notification-warn');
      const infoStyle = getStyle('--notification-info');

      let labels = [];
      let failData = [];
      let warnData = [];
      let infoData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        failData.push(metrics[i].policyViolationsFail);
        warnData.push(metrics[i].policyViolationsWarn);
        infoData.push(metrics[i].policyViolationsInfo);

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          failData.push(metrics[i].policyViolationsFail);
          warnData.push(metrics[i].policyViolationsWarn);
          infoData.push(metrics[i].policyViolationsInfo);
        }
      }

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: this.$t('policy_violation.fails'),
            backgroundColor: 'transparent',
            borderColor: failStyle,
            pointHoverBackgroundColor: '#fff',
            data: failData,
          },
          {
            label: this.$t('policy_violation.warns'),
            backgroundColor: 'transparent',
            borderColor: warnStyle,
            pointHoverBackgroundColor: '#fff',
            data: warnData,
          },
          {
            label: this.$t('policy_violation.infos'),
            backgroundColor: 'transparent',
            borderColor: infoStyle,
            pointHoverBackgroundColor: '#fff',
            data: infoData,
          },
        ],
      };
    },
  },
};
</script>
