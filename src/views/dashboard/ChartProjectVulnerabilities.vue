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
      const totalStyle = getStyle('--notification-note');
      const affectedStyle = getStyle('--notification-warn');
      const nonAffectedStyle = getStyle('--notification-pass');

      let labels = [];
      let totalData = [];
      let affectedData = [];
      let nonAffectedData = [];

      for (let i = 0; i < metrics.length; i++) {
        labels.push(metrics[i].firstOccurrence);
        totalData.push(metrics[i].projects);
        affectedData.push(metrics[i].vulnerableProjects);
        nonAffectedData.push(
          metrics[i].projects - metrics[i].vulnerableProjects,
        );

        if (i === metrics.length - 1) {
          labels.push(metrics[i].lastOccurrence);
          totalData.push(metrics[i].projects);
          affectedData.push(metrics[i].vulnerableProjects);
          nonAffectedData.push(
            metrics[i].projects - metrics[i].vulnerableProjects,
          );
        }
      }

      this.renderChart(
        {
          labels: labels,
          datasets: [
            {
              label: this.$t('message.total'),
              backgroundColor: 'transparent',
              borderColor: totalStyle,
              pointHoverBackgroundColor: '#fff',
              data: totalData,
            },
            {
              label: this.$t('message.non_vulnerable'),
              backgroundColor: hexToRgba(nonAffectedStyle, 10),
              borderColor: nonAffectedStyle,
              pointHoverBackgroundColor: '#fff',
              data: nonAffectedData,
            },
            {
              label: this.$t('message.vulnerable'),
              backgroundColor: hexToRgba(affectedStyle, 10),
              borderColor: affectedStyle,
              pointHoverBackgroundColor: '#fff',
              data: affectedData,
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
