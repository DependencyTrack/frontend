<script>
import common from "../../shared/common"
import { Scatter } from 'vue-chartjs'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips'

export default {
  extends: Scatter,
  props: {
    height: Number
  },
  methods: {
    render: function(findings) {
      let labels = [];
      let cveData = [];
      if (findings && findings.length > 0) {
        for (let i=0; i<findings.length; i++) {
          let finding = findings[i];
          let componentLabel = common.concatenateComponentName(null, finding.component.name, finding.component.version)
          labels.push({ vulnId: finding.vulnerability.vulnId, componentLabel: componentLabel });
          let cvssScore = (finding.vulnerability.cvssV3BaseScore) ? finding.vulnerability.cvssV3BaseScore : finding.vulnerability.cvssV2BaseScore;
          cveData.push({ x: cvssScore, y: finding.vulnerability.epssScore });
        }
      }

      this.renderChart({
        labels: labels,
        datasets: [
          {
            fill: false,
            borderColor: 'rgba(166, 107, 248, 0.5)',
            borderWidth: 8,
            backgroundColor: '#A66BF8',
            data: cveData
          }
        ]
      }, {
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "CVSS",
                fontColor: "#73818F",
              },
              gridLines: {
                color: '#1C2937',
                zeroLineColor: '#1C2937'
              },
              ticks: {
                fontColor: '#21A8D8',
                min: 0,
                max: 10.0
              }
            }
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "EPSS",
                fontColor: "#73818F"
              },
              gridLines: {
                color: '#1C2937',
                zeroLineColor: '#1C2937'
              },
              ticks: {
                display: true,
                fontColor: '#21A8D8',
                min: 0,
                max: 1.0
              }
            }
          ]
        },
        tooltips: {
          enabled: false,
          custom: CustomTooltips,
          intersect: true,
          mode: 'index',
          position: 'nearest',
          callbacks: {
            label: function(tooltipItem, data) {
              let label = data.labels[tooltipItem.index];
              let vulnId = label.vulnId;
              let componentLabel = label.componentLabel;
              return 'Component<br/>Vulnerability<br/>CVSS<br/>EPSS: ' + componentLabel.replace(":", "&#58;") + '<br/>' + vulnId + '<br/>' + tooltipItem.xLabel + '<br/>' + tooltipItem.yLabel;
            }
          }
        },
      })
    }
  }
}
</script>
