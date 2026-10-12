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
      const totalStyle = getStyle('--severity-unassigned');
      const auditedStyle = getStyle('--severity-low');

      let labels = [];
      let totalData = [];
      let auditedData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        totalData.push(metrics[i].findingsTotal);
        auditedData.push(metrics[i].findingsAudited);

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          totalData.push(metrics[i].findingsTotal);
          auditedData.push(metrics[i].findingsAudited);
        }
      }

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: this.$t('message.total_findings'),
            backgroundColor: 'transparent',
            borderColor: totalStyle,
            pointHoverBackgroundColor: '#fff',
            data: totalData,
          },
          {
            label: this.$t('message.findings_audited'),
            backgroundColor: hexToRgba(auditedStyle, 10),
            fill: true,
            borderColor: auditedStyle,
            pointHoverBackgroundColor: '#fff',
            data: auditedData,
          },
        ],
      };
    },
  },
};
</script>
