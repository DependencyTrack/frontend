<script>
import { Line } from 'vue-chartjs'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips'
import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities'
import common from "../../shared/common";

export default {
  extends: Line,
  props: {
    height: Number,
    width: Number
  },
  methods: {
    render: function(metrics) {
      const brandPrimary = getStyle('--primary');
      let chartLabels = [];
      let chartData = [];
      for (let i = 0; i < metrics.length; i++) {
        chartLabels.push(common.formatTimestamp(metrics[i].firstOccurrence));
        chartData.push(metrics[i].vulnerabilities);
      }

      const datasets = [
        {
          label: this.$t('message.vulnerabilities'),
          backgroundColor: brandPrimary,
          borderColor: 'rgba(255,255,255,.55)',
          data: chartData
        }
      ];

      this.renderChart(
        {
          labels: chartLabels,
          datasets: datasets
        },
        {
          tooltips: {
            enabled: false,
            custom: CustomTooltips
          },
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            xAxes: [
              {
                gridLines: {
                  color: 'transparent',
                  zeroLineColor: 'transparent'
                },
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent'
                }
              }
            ],
            yAxes: [
              {
                display: false,
                ticks: {
                  display: false,
                  min: Math.min.apply(Math, datasets[0].data) - 5,
                  max: Math.max.apply(Math, datasets[0].data) + 5
                }
              }
            ]
          },
          elements: {
            line: {
              tension: 0.00001,
              borderWidth: 1
            },
            point: {
              radius: 4,
              hitRadius: 10,
              hoverRadius: 4
            }
          }
        }
      )
    }
  }
}
</script>
