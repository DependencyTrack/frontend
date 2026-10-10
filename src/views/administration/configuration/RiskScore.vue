<template>
  <div>
    <p>{{ $t('admin.risk_score_description') }}</p>
    <p>{{ $t('admin.risk_score_calc') }}</p>
    <br />
    <b-card no-body :header="headers.customRiskScore">
      <b-card-body>
        <p>{{ $t('admin.risk_score_weighting_description') }}</p>
        <c-switch
          id="weight.history.enabled"
          color="primary"
          v-model="customRiskScore.enabled"
          label
          v-bind="labelIcon"
        />{{ $t('admin.enable_risk_score_history_check') }}
        <b-validated-input-group-form-input
          id="custom-risk-score-critical"
          :label="$t('admin.risk_score_weight_critical')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="customRiskScore.critical"
          :tooltip="customRiskScore.criticalTooltip"
        />
        <b-validated-input-group-form-input
          id="custom-risk-score-high"
          :label="$t('admin.risk_score_weight_high')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="customRiskScore.high"
          :tooltip="customRiskScore.highTooltip"
        />
        <b-validated-input-group-form-input
          id="custom-risk-score-medium"
          :label="$t('admin.risk_score_weight_medium')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="customRiskScore.medium"
          :tooltip="customRiskScore.mediumTooltip"
        />
        <b-validated-input-group-form-input
          id="custom-risk-score-low"
          :label="$t('admin.risk_score_weight_low')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="customRiskScore.low"
          :tooltip="customRiskScore.lowTooltip"
        />
        <b-validated-input-group-form-input
          id="custom-risk-score-unassigned"
          :label="$t('admin.risk_score_weight_unassigned')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="customRiskScore.unassigned"
          :tooltip="customRiskScore.unassignedTooltip"
        />
      </b-card-body>
      <b-card-footer>
        <b-button
          size="md"
          class="px-4"
          variant="outline-primary"
          @click="saveCustomRiskScoreSettings"
          >{{ $t('message.update') }}</b-button
        >
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput.vue';
import configPropertyMixin from '../mixins/configPropertyMixin';
import common from '../../../shared/common';
export default {
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
  },
  data() {
    return {
      headers: {
        customRiskScore: this.header + ' - Risk Score Customization',
      },
      type: {
        project: false,
        component: false,
        vulnerability: false,
        vulnerablesofware: false,
        license: false,
        cpe: false,
        servicecomponent: false,
      },
      customRiskScore: {
        enabled: false,
        critical: '10',
        criticalTooltip: '',
        high: '5',
        highTooltip: '',
        medium: '3',
        mediumTooltip: '',
        low: '1',
        lowTooltip: '',
        unassigned: '5',
        unassignedTooltip: '',
      },
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'search-indexes';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'weight.history.enabled':
            this.customRiskScore.enabled = common.toBoolean(item.propertyValue);
            break;
          case 'weight.critical':
            this.customRiskScore.critical = item.propertyValue;
            this.customRiskScore.criticalTooltip = item.description;
            break;
          case 'weight.high':
            this.customRiskScore.high = item.propertyValue;
            this.customRiskScore.highTooltip = item.description;
            break;
          case 'weight.medium':
            this.customRiskScore.medium = item.propertyValue;
            this.customRiskScore.mediumTooltip = item.description;
            break;
          case 'weight.low':
            this.customRiskScore.low = item.propertyValue;
            this.customRiskScore.lowTooltip = item.description;
            break;
          case 'weight.unassigned':
            this.customRiskScore.unassigned = item.propertyValue;
            this.customRiskScore.unassignedTooltip = item.description;
            break;
        }
      }
    });
  },
  methods: {
    saveCustomRiskScoreSettings: function () {
      this.updateConfigProperties([
        {
          groupName: 'risk-score',
          propertyName: 'weight.history.enabled',
          propertyValue: this.customRiskScore.enabled,
        },
        {
          groupName: 'risk-score',
          propertyName: 'weight.critical',
          propertyValue: this.customRiskScore.critical,
        },
        {
          groupName: 'risk-score',
          propertyName: 'weight.high',
          propertyValue: this.customRiskScore.high,
        },
        {
          groupName: 'risk-score',
          propertyName: 'weight.medium',
          propertyValue: this.customRiskScore.medium,
        },
        {
          groupName: 'risk-score',
          propertyName: 'weight.low',
          propertyValue: this.customRiskScore.low,
        },
        {
          groupName: 'risk-score',
          propertyName: 'weight.unassigned',
          propertyValue: this.customRiskScore.unassigned,
        },
      ]);
    },
  },
};
</script>
