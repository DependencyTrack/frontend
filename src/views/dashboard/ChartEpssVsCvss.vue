<template>
  <div>
    <scatter-chart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script>
import '@/shared/chartTheme';
import { hexToRgba } from '@/shared/utils';
import { themeColor } from '@/shared/theme';
import common from '../../shared/common';
import i18n from '../../i18n';
import { Scatter } from 'vue-chartjs';

export default {
  components: { ScatterChart: Scatter },
  data() {
    return {
      findings: null,
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
            },
          },
          y: {
            min: 0,
            max: 1.0,
            title: {
              display: true,
              text: 'EPSS',
            },
          },
        },
      },
    };
  },
  computed: {
    chartData() {
      const findings = this.findings;
      if (!findings) {
        return null;
      }
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

      return {
        datasets: [
          {
            borderColor: hexToRgba(themeColor('--dt-accent'), 50),
            borderWidth: 8,
            backgroundColor: themeColor('--dt-accent'),
            data: cveData,
          },
        ],
      };
    },
  },
  methods: {
    render: function (findings) {
      this.findings = findings;
    },
  },
};
</script>
