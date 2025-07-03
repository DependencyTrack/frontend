<script>
import common from '@/shared/common';
import { Line } from 'vue-chartjs';
import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';

export default {
  extends: Line,
  props: {
    height: Number,
  },
  methods: {
    render: function (metrics) {
      const securityStyle = getStyle('--notification-fail');
      const operationalStyle = getStyle('--notification-warn');
      const licenseStyle = getStyle('--notification-info');
      const labels = [];
      const securityData = [];
      const operationalData = [];
      const licenseData = [];
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
      this.renderChart(
        {
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
        },
        {
          tooltips: {
            enabled: false,
            custom: CustomTooltips,
            intersect: true,
            mode: 'index',
            position: 'nearest',
            callbacks: {
              labelColor: function (tooltipItem, chart) {
                return {
                  backgroundColor:
                    chart.data.datasets[tooltipItem.datasetIndex].borderColor,
                };
              },
              title: function (tooltipItems, data) {
                return common.formatTimestamp(
                  data.labels[tooltipItems[0].index],
                  true,
                );
              },
            },
          },
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                gridLines: {
                  drawOnChartArea: false,
                },
                ticks: {
                  callback: function (value, index) {
                    return common.formatTimestamp(
                      this.chart.data.labels[index],
                    );
                  },
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  maxTicksLimit: 1,
                },
                gridLines: {
                  display: true,
                },
              },
            ],
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
      );
    },
  },
};
</script>
