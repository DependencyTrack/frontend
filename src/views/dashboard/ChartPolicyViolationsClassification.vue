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
      const securityStyle = getStyle('--notification-fail');
      const operationalStyle = getStyle('--notification-warn');
      const licenseStyle = getStyle('--notification-info');
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
      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: this.$t('policy_violation.security'),
            backgroundColor: 'transparent',
            borderColor: securityStyle,
            pointHoverBackgroundColor: '#fff',
            data: securityData,
          },
          {
            label: this.$t('policy_violation.operational'),
            backgroundColor: 'transparent',
            borderColor: operationalStyle,
            pointHoverBackgroundColor: '#fff',
            data: operationalData,
          },
          {
            label: this.$t('policy_violation.license'),
            backgroundColor: 'transparent',
            borderColor: licenseStyle,
            pointHoverBackgroundColor: '#fff',
            data: licenseData,
          },
        ],
      };
    },
  },
};
</script>
