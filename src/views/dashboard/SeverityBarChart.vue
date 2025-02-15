<script>
import { HorizontalBar } from 'vue-chartjs';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';

export default {
  components: {
    hexToRgba,
    CustomTooltips,
  },
  extends: HorizontalBar,
  props: {
    height: Number,
    width: Number,
  },
  data() {
    return {
      dataset: [
        {
          categoryPercentage: 1,
          barPercentage: 0.5,
          backgroundColor: [
            '#f86c6b',
            '#fd8c00',
            '#ffc107',
            '#4dbd74',
            '#777777',
          ],
          data: [40, 10, 12, 39, 50], //TODO
        },
      ],
    };
  },
  methods: {
    render: function (metric) {
      this.renderChart(
        {
          labels: [
            this.$t('severity.critical'),
            this.$t('severity.high'),
            this.$t('severity.medium'),
            this.$t('severity.low'),
            this.$t('severity.unassigned'),
          ],
          datasets: this.dataset,
        },
        {
          tooltips: {
            enabled: false,
            custom: CustomTooltips,
          },
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                display: false,
              },
            ],
            yAxes: [
              {
                display: false,
              },
            ],
          },
        },
      );
    },
  },
};
</script>
