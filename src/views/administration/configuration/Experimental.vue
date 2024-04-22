<template>
  <div>
    <b-card no-body :header="header">
      <b-card-body>
        <p>{{ $t('admin.experimental_info') }}</p>
        <c-switch
          id="project"
          color="primary"
          v-model="uploadV2"
          label
          v-bind="labelIcon"
        />{{ $t('admin.experimental_bom_upload_v2') }}
        <p class="font-sm text-muted">
          <span class="fa fa-info-circle"></span>
          {{ $t('admin.experimental_bom_upload_v2_info') }}
        </p>
      </b-card-body>
      <b-card-footer>
        <b-button variant="outline-primary" class="px-4" @click="saveChanges">
          {{ $t('message.update') }}
        </b-button>
      </b-card-footer>
    </b-card>
  </div>
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
      uploadV2: false,
    };
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'experimental',
          propertyName: 'bom.processing.task.v2.enabled',
          propertyValue: this.uploadV2,
        },
      ]);
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'experimental';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'bom.processing.task.v2.enabled':
            this.uploadV2 = common.toBoolean(item.propertyValue);
            break;
        }
      }
    });
  },
};
</script>
