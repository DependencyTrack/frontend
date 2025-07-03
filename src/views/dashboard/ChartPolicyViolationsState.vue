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
      const failStyle = getStyle('--notification-fail');
      const warnStyle = getStyle('--notification-warn');
      const infoStyle = getStyle('--notification-info');
      const collectionLogicChangedStyle = getStyle(
        '--collection-logic-changed',
      );

      const labels = [];
      const failData = [];
      const warnData = [];
      const infoData = [];
      const collectionLogicChangedData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        failData.push(metrics[i].policyViolationsFail);
        warnData.push(metrics[i].policyViolationsWarn);
        infoData.push(metrics[i].policyViolationsInfo);
        collectionLogicChangedData.push(metrics[i].collectionLogicChanged);

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          failData.push(metrics[i].policyViolationsFail);
          warnData.push(metrics[i].policyViolationsWarn);
          infoData.push(metrics[i].policyViolationsInfo);
        }
      }

      this.renderChart(
        {
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
