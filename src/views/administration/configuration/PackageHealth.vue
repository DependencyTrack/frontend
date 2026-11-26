<template>
  <b-card no-body :header="$t('admin.package_health')">
    <b-card-body>
      <b-form-checkbox id="package-health-enabled" v-model="enabled" switch>{{
        $t('admin.package_health_resolution_enable')
      }}</b-form-checkbox>
      <b-form-text>
        {{ $t('admin.package_health_resolution_help') }}
      </b-form-text>
    </b-card-body>
    <b-card-footer>
      <b-button class="px-4" variant="primary" @click="saveChanges">{{
        $t('message.update')
      }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
// Options API, because the configuration property helpers are a mixin.
import configPropertyMixin from '../mixins/configPropertyMixin';
import common from '../../../shared/common';

export default {
  mixins: [configPropertyMixin],
  data() {
    return {
      enabled: true,
    };
  },
  methods: {
    saveChanges() {
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
      const item = response.data.find(
        (property) =>
          property.groupName === 'package-health' &&
          property.propertyName === 'enabled',
      );
      if (item) {
        this.enabled = common.toBoolean(item.propertyValue);
      }
    });
  },
};
</script>
