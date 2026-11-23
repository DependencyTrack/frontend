<template>
  <div>
    <line-chart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script>
import '@/shared/chartTheme';
import common from '../../shared/common';
import { Line } from 'vue-chartjs';
import { themeColor } from '@/shared/theme';
export default {
  components: { LineChart: Line },
  data() {
    return {
      metrics: null,
      options: {
        maintainAspectRatio: false,
        plugins: {
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
      const securityStyle = themeColor('--notification-fail');
      const operationalStyle = themeColor('--notification-warn');
      const licenseStyle = themeColor('--notification-info');
      let labels = [];
      let securityData = [];
      let operationalData = [];
      let licenseData = [];
      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        securityData.push(metrics[i].policyViolationsSecurityTotal);
        operationalData.push(metrics[i].policyViolationsOperationalTotal);
        licenseData.push(metrics[i].policyViolationsLicenseTotal);
        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          securityData.push(metrics[i].policyViolationsSecurityTotal);
          operationalData.push(metrics[i].policyViolationsOperationalTotal);
          licenseData.push(metrics[i].policyViolationsLicenseTotal);
        }
      }
      return {
        labels: labels,
        datasets: [
          {
            label: this.$t('policy_violation.security'),
            backgroundColor: 'transparent',
            borderColor: securityStyle,
            pointHoverBackgroundColor: themeColor('--dt-surface-card'),
            data: securityData,
          },
          {
            label: this.$t('policy_violation.operational'),
            backgroundColor: 'transparent',
            borderColor: operationalStyle,
            pointHoverBackgroundColor: themeColor('--dt-surface-card'),
            data: operationalData,
          },
          {
            label: this.$t('policy_violation.license'),
            backgroundColor: 'transparent',
            borderColor: licenseStyle,
            pointHoverBackgroundColor: themeColor('--dt-surface-card'),
            data: licenseData,
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
