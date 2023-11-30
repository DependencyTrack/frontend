<template>
  <div>
    <p>{{ $t('admin.index_risk_score_description') }}</p>
    <p>{{ $t('admin.index_risk_score_calc') }}</p>
    <br/>
    <b-card no-body :header="headers.consistencyCheck">
      <b-card-body>
        <p>{{ $t('admin.index_risk_score_weighting_description') }}</p>
        <c-switch id="consistency-check-enabled" color="primary" v-model="consistencyCheck.enabled" label v-bind="labelIcon" />{{$t('admin.enable_risk_score_history_check')}}
        <b-validated-input-group-form-input
          id="risk_score_weight_critical"
          :label="$t('admin.risk_score_weight_critical')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="consistencyCheck.critical"
          :tooltip="consistencyCheck.criticalTooltip"
        />
        <b-validated-input-group-form-input
          id="consistency-check-threshold"
          :label="$t('admin.risk_score_weight_high')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="consistencyCheck.high"
          :tooltip="consistencyCheck.highTooltip"
        />
        <b-validated-input-group-form-input
          id="consistency-check-threshold"
          :label="$t('admin.risk_score_weight_medium')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="consistencyCheck.medium"
          :tooltip="consistencyCheck.mediumTooltip"
        />
        <b-validated-input-group-form-input
          id="consistency-check-threshold"
          :label="$t('admin.risk_score_weight_low')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="consistencyCheck.low"
          :tooltip="consistencyCheck.lowTooltip"
        />
        <b-validated-input-group-form-input
          id="consistency-check-threshold"
          :label="$t('admin.risk_score_weight_unassigned')"
          input-group-size="mb-3"
          rules="required|min_value:1|max_value:10"
          type="number"
          v-model="consistencyCheck.unassigned"
          :tooltip="consistencyCheck.unassignedTooltip"
        />
      </b-card-body>
      <b-card-footer>
        <b-button size="md" class="px-4" variant="outline-primary" @click="saveConsistencyCheckSettings">{{ $t('message.update') }}</b-button>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';
  import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';
  import configPropertyMixin from "../mixins/configPropertyMixin";
  import common from "../../../shared/common";

  export default {
    mixins: [configPropertyMixin],
    props: {
      header: String
    },
    components: {
      cSwitch,
      BValidatedInputGroupFormInput
    },
    data() {
      return {
        headers: {
          consistencyCheck: this.header + " - Risk Score Customization"
        },
        type: {
          project: false,
          component: false,
          vulnerability: false,
          vulnerablesofware: false,
          license: false,
          cpe: false,
          servicecomponent:false
        },
        consistencyCheck: {
          enabled: false,
          critical: "10",
          criticalTooltip: "",
          high: "5",
          highTooltip: "",
          medium: "3",
          mediumTooltip: "",
          low: "1",
          lowTooltip: "",
          unassigned: "5",
          unassignedTooltip: "",
        }
      }
    },
    created () {
      this.axios.get(this.configUrl).then((response) => {
        let configItems = response.data.filter(function (item) { return item.groupName === "search-indexes" });
        for (let i=0; i<configItems.length; i++) {
          let item = configItems[i];
          switch (item.propertyName) {
            case "consistency.check.enabled":
              this.consistencyCheck.enabled = common.toBoolean(item.propertyValue); break;
            case "consistency.check.cadence":
              this.consistencyCheck.cadence = item.propertyValue;
              this.consistencyCheck.cadenceTooltip = item.description; break;
            case "consistency.check.delta.threshold":
              this.consistencyCheck.threshold = item.propertyValue;
              this.consistencyCheck.thresholdTooltip = item.description; break;
          }
        }
      });
    },
    methods: {
      saveConsistencyCheckSettings: function() {
        this.updateConfigProperties([
          {groupName: 'search-indexes', propertyName: 'consistency.check.enabled', propertyValue: this.consistencyCheck.enabled},
          {groupName: 'search-indexes', propertyName: 'consistency.check.cadence', propertyValue: this.consistencyCheck.cadence},
          {groupName: 'search-indexes', propertyName: 'consistency.check.delta.threshold', propertyValue: this.consistencyCheck.threshold}
        ]);
      },
      reindex: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_SEARCH}/reindex`;
        let params = new URLSearchParams();
        Object.entries(this.type).forEach(([key, value]) => {
          if(value) {
            params.append('type', key.toUpperCase());
          }
        });
        this.axios.post(url, null, { params: params }).then((response) => {
          this.$toastr.s(this.$t('admin.reindex_submitted'));
        }).catch((error) => {
          this.$toastr.s(this.$t('admin.reindex_error'));
        });
      }
    }
  }
</script>
