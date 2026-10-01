<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        id="package-health-enabled"
        color="primary"
        v-model="enabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.package_health_resolution_enable') }}
      <b-form-text>
        {{ $t('admin.package_health_resolution_help') }}
      </b-form-text>
    </b-card-body>
    <b-card-footer>
      <b-button
        size="md"
        class="px-4"
        variant="outline-primary"
        @click="saveChanges"
        >{{ $t('message.update') }}</b-button
      >
    </b-card-footer>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import configPropertyMixin from '../mixins/configPropertyMixin';
import common from '../../../shared/common';

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
      enabled: true,
    };
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'package-health',
          propertyName: 'enabled',
          propertyValue: this.enabled,
        },
      ]);
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'package-health';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        if (item.propertyName === 'enabled') {
          this.enabled = common.toBoolean(item.propertyValue);
        }
      }
    });
  },
};
</script>
