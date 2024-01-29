<script>
  import common from "../../shared/common"
  import { Line } from 'vue-chartjs'
  import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities'
  import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips'

  export default {
    extends: Line,
    props: {
      height: Number
    },
    methods: {
      render: function(metrics) {
        const totalStyle = getStyle('--notification-note');
        const affectedStyle = getStyle('--notification-warn');

        let labels = [];
        let totalData = [];
        let affectedData = [];

        for (let i = 0; i < metrics.length; i++) {
          labels.push(common.formatTimestamp(metrics[i].firstOccurrence));
          totalData.push(metrics[i].projects);
          affectedData.push(metrics[i].vulnerableProjects);

          if (i === metrics.length - 1) {
            labels.push(common.formatTimestamp(metrics[i].lastOccurrence));
            totalData.push(metrics[i].projects);
            affectedData.push(metrics[i].vulnerableProjects);
          }
        }

        this.renderChart({
          labels: labels,
          datasets: [
            {
              label: this.$t('message.total'),
              backgroundColor: 'transparent',
              borderColor: totalStyle,
              pointHoverBackgroundColor: '#fff',
              data: totalData
            },
            {
              label: this.$t('message.vulnerable'),
              backgroundColor: hexToRgba(affectedStyle, 10),
              borderColor: affectedStyle,
              pointHoverBackgroundColor: '#fff',
              data: affectedData
            }
          ]
        }, {
          tooltips: {
            enabled: false,
            custom: CustomTooltips,
            intersect: true,
            mode: 'index',
            position: 'nearest',
            callbacks: {
              labelColor: function (tooltipItem, chart) {
                return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
              }
            }
          },
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              gridLines: {
                drawOnChartArea: false
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 1
              },
              gridLines: {
                display: true
              }
            }]
          },
          elements: {
            line: {
              tension: 0.1,
              borderWidth: 2
            },
            point: {
              radius: 0,
              hitRadius: 20,
              hoverRadius: 4,
              hoverBorderWidth: 3
            }
          }
        })
      }
    }
  }
</script>
