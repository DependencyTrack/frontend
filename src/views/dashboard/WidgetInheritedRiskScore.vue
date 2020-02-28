<script>
import { Line } from 'vue-chartjs'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips'
import common from "../../shared/common";
import {getStyle} from "@coreui/coreui/dist/js/coreui-utilities";

export default {
  extends: Line,
  props: {
    height: Number,
    width: Number
  },
  methods: {
    render: function (metrics) {
      const widgetColor = getStyle('--widget-4');
      let chartLabels = [];
      let chartData = [];
      for (let i = 0; i < metrics.length; i++) {
        chartLabels.push(common.formatTimestamp(metrics[i].firstOccurrence));
        chartData.push(metrics[i].inheritedRiskScore);
      }

      const datasets = [
        {
          label: this.$t('message.risk_score'),
          backgroundColor: widgetColor,
          borderColor: 'rgba(255,255,255,.70)',
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
              borderWidth: 2
            },
            point: {
              radius: 0,
              hitRadius: 50,
              hoverRadius: 4
            }
          }
        }
      )
    }
  }
}
</script>
