<template>
  <div>
    <scatter-chart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script>
import 'chart.js/auto';
import common from '../../shared/common';
import i18n from '../../i18n';
import { Scatter } from 'vue-chartjs';
import { getStyle } from '@/shared/utils';

export default {
  components: { ScatterChart: Scatter },
  data() {
    const gridColor = getStyle('--chart-grid-color');
    const tickColor = getStyle('--chart-tick-color');
    return {
      chartData: null,
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const { vulnId, componentLabel, x, y } = context.raw;
                return [
                  `${i18n.global.t('message.component')}: ${componentLabel}`,
                  `${i18n.global.t('message.vulnerability')}: ${vulnId}`,
                  `${i18n.global.t('message.cvss')}: ${x}`,
                  `${i18n.global.t('message.epss')}: ${y}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 10.0,
            title: {
              display: true,
              text: 'CVSS',
              color: '#73818F',
            },
            grid: {
              color: gridColor,
            },
            ticks: {
              color: tickColor,
            },
          },
          y: {
            min: 0,
            max: 1.0,
            title: {
              display: true,
              text: 'EPSS',
              color: '#73818F',
            },
            grid: {
              color: gridColor,
            },
            ticks: {
              color: tickColor,
            },
          },
        },
      },
    };
  },
  methods: {
    render: function (findings) {
      let cveData = [];
      if (findings && findings.length > 0) {
        for (let i = 0; i < findings.length; i++) {
          let finding = findings[i];
          let componentLabel = common.concatenateComponentName(
            null,
            finding.component.name,
            finding.component.version,
          );
          let cvssScore =
            typeof finding.vulnerability.cvssV4Score === 'number'
              ? finding.vulnerability.cvssV4Score
              : typeof finding.vulnerability.cvssV3BaseScore === 'number'
                ? finding.vulnerability.cvssV3BaseScore
                : finding.vulnerability.cvssV2BaseScore;
          cveData.push({
            x: cvssScore,
            y: finding.vulnerability.epssScore,
            vulnId: finding.vulnerability.vulnId,
            componentLabel: componentLabel,
          });
        }
      }

      this.chartData = {
        datasets: [
          {
            borderColor: 'rgba(166, 107, 248, 0.5)',
            borderWidth: 8,
            backgroundColor: '#A66BF8',
            data: cveData,
          },
        ],
      };
    },
  },
};
</script>
