<template>
  <b-modal id="generalTemplateConfigurationModal" size="md" hide-header-close no-stacking :title="$t('admin.general_template_configuration')" @show="loadConfigProperties">
    <b-form-group>
        <c-switch id="template_override" color="primary" v-model="enableDefaultTemplatesOverride" label v-bind="labelIcon"/>
        {{ $t('admin.enable_default_template_override') }}
    </b-form-group>
    <b-validated-input-group-form-input
        id="template_basedir"
        :label="$t('admin.template_basedir')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="templateBasedir"
        tooltip="This property is used as base directory for notification templates search."
    />
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="updateConfiguration()">{{ $t('message.update') }}</b-button>
      <b-button size="md" variant="primary" @click="restoreDefaultTemplates()">{{ $t('admin.restore_default_template') }}</b-button>
    </template>
  </b-modal>
</template>
<script>
  import configPropertyMixin from "../mixins/configPropertyMixin";
  import { Switch as cSwitch } from '@coreui/vue';
  import common from "../../../shared/common";
  import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';

  export default {
    mixins: [configPropertyMixin],
    components: {
      cSwitch,
      BValidatedInputGroupFormInput
    },
    data() {
      return {
        enableDefaultTemplatesOverride: null,
        templateBasedir: null
      }
    },
    methods: {
      updateConfiguration: function() {
        this.$root.$emit('bv::hide::modal', 'generalTemplateConfigurationModal');
        this.updateConfigProperties([
          {groupName: 'notification', propertyName: 'template.baseDir', propertyValue: this.templateBasedir},
          {groupName: 'notification', propertyName: 'template.default.override.enabled', propertyValue: this.enableDefaultTemplatesOverride}
        ]);
      },
      restoreDefaultTemplates: function() {
        this.$root.$emit('bv::hide::modal', 'generalTemplateConfigurationModal');
        let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}/restoreDefaultTemplates`;
        this.axios.post(url).then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.default_template_restored'));
        }).catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      },
      loadConfigProperties () {
        this.axios.get(this.configUrl).then((response) => {
          let configItems = response.data.filter(function (item) { return item.groupName === "notification" });
          for (let i=0; i<configItems.length; i++) {
            let item = configItems[i];
            switch (item.propertyName) {
              case "template.baseDir":
                this.templateBasedir = item.propertyValue; break;
              case "template.default.override.enabled":
                this.enableDefaultTemplatesOverride = common.toBoolean(item.propertyValue); break;
            }
          }
        });
      }
    }
  }
</script>
