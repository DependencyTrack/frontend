<template>
  <div>
    <line-chart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script>
import '@/shared/chartTheme';
import common from '../../shared/common';
import { Line } from 'vue-chartjs';
import { hexToRgba } from '@/shared/utils';
import { themeColor } from '@/shared/theme';

export default {
  components: { LineChart: Line },
  data() {
    return {
      metrics: null,
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
  computed: {
    chartData() {
      const metrics = this.metrics;
      if (!metrics) {
        return null;
      }
      const totalStyle = themeColor('--severity-unassigned');
      const auditedStyle = themeColor('--severity-low');

      let labels = [];
      let totalData = [];
      let auditedData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        totalData.push(metrics[i].policyViolationsTotal);
        auditedData.push(metrics[i].policyViolationsAudited);

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          totalData.push(metrics[i].policyViolationsTotal);
          auditedData.push(metrics[i].policyViolationsAudited);
        }
      }

      return {
        labels: labels,
        datasets: [
          {
            label: this.$t('message.policy_violations'),
            backgroundColor: 'transparent',
            borderColor: totalStyle,
            pointHoverBackgroundColor: themeColor('--dt-surface-card'),
            data: totalData,
          },
          {
            label: this.$t('message.violations_audited'),
            backgroundColor: hexToRgba(auditedStyle, 10),
            fill: true,
            borderColor: auditedStyle,
            pointHoverBackgroundColor: themeColor('--dt-surface-card'),
            data: auditedData,
          },
        ],
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
