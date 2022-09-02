<template>
  <b-card no-body :header="header">
    <b-card-body>
      <img alt="OSV logo" src="@/assets/img/osv-logo.png" width="65"/>
      <hr/>
      <c-switch
        color="primary"
        id="vulnsourceEnabled"
        label
        v-bind="labelIcon"
        v-model="vulnsourceEnabled"
      />
      {{$t('admin.vulnsource_osv_advisories_enable')}}
      <hr/>
      {{ $t('admin.vulnsource_osv_advisories_desc') }}
    </b-card-body>
    <b-card-body>
      <b-form-group label="Ecosystems">
        <div class="list-group" style="width: 40%">
          <span v-for="ecosystem in enabledEcosystems" :key="ecosystem">
            <actionable-list-group-item :value="ecosystem" :delete-icon="true" @actionClicked="removeEcosystem(ecosystem)"/>
          </span>
          <actionable-list-group-item :add-icon="true" @actionClicked="$root.$emit('bv::show::modal', 'ecosystemModal')"/>
        </div>
      </b-form-group>
      <hr/>
    </b-card-body>
    <b-card-footer>
      <b-button
        @click="saveChanges"
        class="px-4"
        variant="outline-primary">
          {{ $t('message.update') }}
      </b-button>
    </b-card-footer>
    <ecosystem-modal v-on:selection="updateEcosystem"/>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import common from "../../../shared/common";
import configPropertyMixin from "../mixins/configPropertyMixin";
import EcosystemModal from "./EcosystemModal";
import ActionableListGroupItem from '../../components/ActionableListGroupItem.vue';

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String
  },
  components: {
    cSwitch,
    EcosystemModal,
    ActionableListGroupItem
},
  data() {
    return {
      vulnsourceEnabled: false,
      listOfEcosystems: [],
      enabledEcosystems: [],
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715'
      },
    }
  },
  methods: {
    saveChanges: function() {
      this.updateConfigProperties([
        {groupName: 'vuln-source', propertyName: 'google.osv.enabled', propertyValue: this.vulnsourceEnabled}
      ]);
    },
    removeEcosystem: function(ecosystem) {
      this.updateConfigProperties([
        {groupName: 'osv-ecosystems', propertyName: ecosystem, propertyValue: "false"}
      ]);
      this.enabledEcosystems = this.enabledEcosystems.filter(e => e !== ecosystem);
    },
    updateEcosystem: function(ecosystems) {
      this.$root.$emit('bv::hide::modal', 'ecosystemModal');
      for(let i=0; i<ecosystems.length; i++) {
        let ecosystem = ecosystems[i];
        this.updateConfigProperties([
          {groupName: 'osv-ecosystems', propertyName: ecosystem.name, propertyValue: "true"}
        ]);
        this.enabledEcosystems.push(ecosystem.name);
      }
    }
  },
  created () {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) { return item.groupName === "vuln-source" });
      for (let i=0; i<configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case "google.osv.enabled":
            this.vulnsourceEnabled = common.toBoolean(item.propertyValue); break;
        }
      }
      let ecosystemConfigItems = response.data.filter(function (item) { return item.groupName === "osv-ecosystems" });
      for (let i=0; i<ecosystemConfigItems.length; i++) {
        let item = ecosystemConfigItems[i];
        this.listOfEcosystems.push(item);
        switch (item.propertyValue) {
          case "true":
            this.enabledEcosystems.push(item.propertyName);
        }
      }
    });
  }
}
</script>
