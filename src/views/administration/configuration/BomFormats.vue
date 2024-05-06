<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>{{ $t('admin.bom_formats_desc') }}</p>
      <div>
        <c-switch
          color="primary"
          v-model="isCycloneDXEnabled"
          label
          v-bind="labelIcon"
        />{{ $t('admin.enable_bom_cyclonedx') }}
      </div>
      <div>
        <c-switch
          id="component"
          color="primary"
          v-model="bomValidate"
          label
          v-bind="labelIcon"
        />{{ $t('admin.bom_validation') }}
        <p class="font-sm text-muted">
          <span class="fa fa-info-circle"></span>
          {{ $t('admin.bom_validation_info') }}
        </p>
      </div>
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{
        $t('message.update')
      }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import common from '../../../shared/common';
import configPropertyMixin from '../mixins/configPropertyMixin';

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    cSwitch,
  },
  data() {
    return {
      isCycloneDXEnabled: false,
      bomValidate: true,
    };
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'artifact',
          propertyName: 'cyclonedx.enabled',
          propertyValue: this.isCycloneDXEnabled,
        },
        {
          groupName: 'artifact',
          propertyName: 'bom.validation.enabled',
          propertyValue: this.bomValidate,
        },
      ]);
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'artifact' && item.propertyType === 'BOOLEAN';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        let enabled = common.toBoolean(item.propertyValue);
        switch (item.propertyName) {
          case 'cyclonedx.enabled':
            this.isCycloneDXEnabled = enabled;
            break;
          case 'bom.validation.enabled':
            this.bomValidate = common.toBoolean(item.propertyValue);
            break;
        }
      }
    });
  },
};
</script>
