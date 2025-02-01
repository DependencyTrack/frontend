<script>
import common from '../../shared/common';
import { Line } from 'vue-chartjs';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';

export default {
  extends: Line,
  props: {
    height: Number,
  },
  methods: {
    render: function (metrics) {
      const totalStyle = getStyle('--severity-unassigned');
      const auditedStyle = getStyle('--severity-low');
      const collectionLogicChangedStyle = getStyle(
        '--collection-logic-changed',
      );

      let labels = [];
      let totalData = [];
      let auditedData = [];
      let collectionLogicChangedData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        totalData.push(metrics[i].policyViolationsTotal);
        auditedData.push(metrics[i].policyViolationsAudited);
        collectionLogicChangedData.push(metrics[i].collectionLogicChanged);

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          totalData.push(metrics[i].policyViolationsTotal);
          auditedData.push(metrics[i].policyViolationsAudited);
        }
      }

      this.renderChart(
        {
          labels: labels,
          datasets: [
            {
              label: this.$t('message.policy_violations'),
              backgroundColor: 'transparent',
              borderColor: totalStyle,
              pointHoverBackgroundColor: '#fff',
              data: totalData,
            },
            {
              label: this.$t('message.violations_audited'),
              backgroundColor: hexToRgba(auditedStyle, 10),
              borderColor: auditedStyle,
              pointHoverBackgroundColor: '#fff',
              data: auditedData,
            },
            {
              label: this.$t('message.collection_logic_changed'),
              backgroundColor: 'transparent',
              borderColor: collectionLogicChangedStyle,
              showLine: false,
              pointBorderColor: (context) => {
                const value = context.dataset.data[context.dataIndex];
                return value === true
                  ? collectionLogicChangedStyle
                  : 'transparent';
              },
              pointBorderWidth: 400,
              pointHoverBorderWidth: 400,
              data: collectionLogicChangedData,
              pointStyle: 'line',
              pointRadius: 1,
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
