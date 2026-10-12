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
      const criticalStyle = getStyle('--severity-critical');
      const highStyle = getStyle('--severity-high');
      const mediumStyle = getStyle('--severity-medium');
      const lowStyle = getStyle('--severity-low');
      const unassignedStyle = getStyle('--severity-unassigned');

      let labels = [];
      let criticalData = [];
      let highData = [];
      let mediumData = [];
      let lowData = [];
      let unassignedData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        criticalData.push(metrics[i].critical);
        highData.push(metrics[i].high);
        mediumData.push(metrics[i].medium);
        lowData.push(metrics[i].low);
        unassignedData.push(metrics[i].unassigned);

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          criticalData.push(metrics[i].critical);
          highData.push(metrics[i].high);
          mediumData.push(metrics[i].medium);
          lowData.push(metrics[i].low);
          unassignedData.push(metrics[i].unassigned);
        }
      }

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: this.$t('severity.critical'),
            backgroundColor: 'transparent',
            borderColor: criticalStyle,
            pointHoverBackgroundColor: '#fff',
            data: criticalData,
          },
          {
            label: this.$t('severity.high'),
            backgroundColor: 'transparent',
            borderColor: highStyle,
            pointHoverBackgroundColor: '#fff',
            data: highData,
          },
          {
            label: this.$t('severity.medium'),
            backgroundColor: 'transparent',
            borderColor: mediumStyle,
            pointHoverBackgroundColor: '#fff',
            data: mediumData,
          },
          {
            label: this.$t('severity.low'),
            backgroundColor: 'transparent',
            borderColor: lowStyle,
            pointHoverBackgroundColor: '#fff',
            data: lowData,
          },
          {
            label: this.$t('severity.unassigned'),
            backgroundColor: 'transparent',
            borderColor: unassignedStyle,
            pointHoverBackgroundColor: '#fff',
            data: unassignedData,
          },
        ],
      };
    },
  },
};
</script>
