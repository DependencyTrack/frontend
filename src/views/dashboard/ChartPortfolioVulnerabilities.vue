<script>
import common from '../../shared/common';
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
      const criticalStyle = getStyle('--severity-critical');
      const highStyle = getStyle('--severity-high');
      const mediumStyle = getStyle('--severity-medium');
      const lowStyle = getStyle('--severity-low');
      const unassignedStyle = getStyle('--severity-unassigned');
      const collectionLogicChangedStyle = getStyle(
        '--collection-logic-changed',
      );

      let labels = [];
      let criticalData = [];
      let highData = [];
      let mediumData = [];
      let lowData = [];
      let unassignedData = [];
      let collectionLogicChangedData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        criticalData.push(metrics[i].critical);
        highData.push(metrics[i].high);
        mediumData.push(metrics[i].medium);
        lowData.push(metrics[i].low);
        unassignedData.push(metrics[i].unassigned);
        collectionLogicChangedData.push(metrics[i].collectionLogicChanged);

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          criticalData.push(metrics[i].critical);
          highData.push(metrics[i].high);
          mediumData.push(metrics[i].medium);
          lowData.push(metrics[i].low);
          unassignedData.push(metrics[i].unassigned);
        }
      }

      this.renderChart(
        {
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
