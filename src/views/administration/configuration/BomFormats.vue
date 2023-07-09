<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>{{ $t('admin.bom_formats_desc')}}</p>
      <div>
        <CSwitch color="primary" :checked.sync="isCycloneDXEnabled" label />{{$t('admin.enable_bom_cyclonedx')}}
      </div>
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{ $t('message.update') }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
  import { CSwitch } from '@coreui/vue';
  import common from "../../../shared/common";
  import configPropertyMixin from "../mixins/configPropertyMixin";

  export default {
    mixins: [configPropertyMixin],
    props: {
      header: String
    },
    components: {
      CSwitch
    },
    data() {
      return {
        isCycloneDXEnabled: false
      }
    },
    methods: {
      saveChanges: function() {
        this.updateConfigProperties([
          {groupName: 'artifact', propertyName: 'cyclonedx.enabled', propertyValue: this.isCycloneDXEnabled}
        ]);
      }
    },
    created () {
      this.axios.get(this.configUrl).then((response) => {
        let configItems = response.data.filter(function (item) { return item.groupName === "artifact" && item.propertyType === "BOOLEAN" });
        for (let i=0; i<configItems.length; i++) {
          let item = configItems[i];
          let enabled = common.toBoolean(item.propertyValue);
          switch (item.propertyName) {
            case "cyclonedx.enabled":
              this.isCycloneDXEnabled = enabled; break;
          }
        }
      });
    }
  }
</script>
