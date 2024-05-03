<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        id="scannerEnabled"
        color="primary"
        v-model="scannerEnabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_internal_enable') }}
      <br />
      <c-switch
        id="scannerCpeFuzzyEnableInput"
        color="primary"
        v-model="scannerCpeFuzzyEnableInput"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_internal_fuzzy_enable') }}
      <br />
      <c-switch
        id="scannerCpeFuzzyExcludePurlInput"
        color="primary"
        v-model="scannerCpeFuzzyExcludePurlInput"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_internal_fuzzy_exclude_purl') }}
      <br />
      <c-switch
        id="scannerCpeFuzzyExcludeInternalInput"
        color="primary"
        v-model="scannerCpeFuzzyExcludeInternalInput"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_internal_fuzzy_exclude_internal') }}
      {{ $t('admin.analyzer_internal_desc') }}
      <hr/>
      <h4>Avoid Duplicates with alias</h4>
      <br/>
      <p>{{ $t('admin.analyzer_internal_deduplication_desc') }}</p>
      <p class="font-sm text-muted">
        <span class="fa fa-warning">&nbsp;</span>
        {{ $t('admin.analyzer_internal_deduplication_warning') }}
      </p>
      <c-switch
        color="primary"
        id="deduplicationEnabled"
        label
        v-bind="labelIcon"
        v-model="deduplicationEnabled"
        :value="enabledSources.length > 0"
      />
      {{ $t('admin.analyzer_internal_deduplication_enable') }}
      <hr/>
      <b-form-group
      :disabled="!deduplicationEnabled"
      class="muted">
        <div class="list-group" style="width: 40%">
        <actionable-list-group-item
          :value="'Priotization of Vulnerability Sources'"
          :refresh="true"
          @actionClicked=updateSources();
        />
        <draggable
        v-model="enabledSources"
        class="list-group"
        handle=".drag-handle"
        @end="updatePositions"
        :disabled="!deduplicationEnabled"
        >
          <span v-for="(source, index) in enabledSources" :key="source" class="list-group-item">
            <actionable-list-group-item
              :value="source"
              :index="index"
              :delete-icon="false"
              :drag-icon="true"
              :priority="true"
            />
          </span>
        </draggable>
      </div>
      </b-form-group>
      <hr/>
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
import ActionableListGroupItem from '../../components/ActionableListGroupItem.vue';
import draggable from "vuedraggable";


export default {
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    cSwitch,
    ActionableListGroupItem,
    draggable,

  },
  data() {
    return {
      scannerEnabled: false,
      scannerCpeFuzzyEnableInput: false,
      scannerCpeFuzzyExcludePurlInput: true,
      scannerCpeFuzzyExcludeInternalInput: true,
      deduplicationEnabled: false,
      sourceConfig: null,
      enabledSources: [],
      positions: [],
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      data: [],
      options: {},
      info : null,
    };
  },
  methods: {
    updatePositions() {
      this.positions = this.enabledSources.reduce(
        (accumulator, item, index) => ({ ...accumulator, [item]: index }),
        {}
      );
    },
    updateSources() {
      for (let i = 0; i < this.info.length; i++) {
        let source = this.info[i];

        if (!this.enabledSources.includes(source)) {
          this.enabledSources.push(source);
        }
      }
      // Remove sources from enabledSources that are not in info
      for (let i = this.enabledSources.length - 1; i >= 0; i--) {
        let source = this.enabledSources[i];

        if (!this.info.includes(source)) {
          this.enabledSources.splice(i, 1);
        }
      }
    },
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'scanner',
          propertyName: 'internal.enabled',
          propertyValue: this.scannerEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'internal.fuzzy.enabled',
          propertyValue: this.scannerCpeFuzzyEnableInput,
        },
        {
          groupName: 'scanner',
          propertyName: 'internal.fuzzy.exclude.purl',
          propertyValue:
            !this.scannerCpeFuzzyEnableInput ||
            !this.scannerCpeFuzzyExcludePurlInput,
        },
        {
          groupName: 'scanner',
          propertyName: 'internal.fuzzy.exclude.internal',
          propertyValue:
            !this.scannerCpeFuzzyEnableInput ||
            !this.scannerCpeFuzzyExcludeInternalInput,
        },
        {
          groupName: 'scanner',
          propertyName: 'internal.deduplication.enabled',
          propertyValue: this.deduplicationEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'internal.deduplication.list',
          propertyValue: this.enabledSources.join(';'),
        },
      ]);
      if (!this.scannerCpeFuzzyEnableInput) {
        this.scannerCpeFuzzyExcludePurlInput = false;
        this.scannerCpeFuzzyExcludeInternalInput = false;
      }
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'scanner';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'internal.enabled':
            this.scannerEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'internal.fuzzy.enabled':
            this.scannerCpeFuzzyEnableInput = common.toBoolean(
              item.propertyValue,
            );
            break;
          case 'internal.fuzzy.exclude.purl':
            this.scannerCpeFuzzyExcludePurlInput = !common.toBoolean(
              item.propertyValue,
            );
            break;
          case 'internal.fuzzy.exclude.internal':
            this.scannerCpeFuzzyExcludeInternalInput = !common.toBoolean(
              item.propertyValue,
            );
            break;
          case 'internal.deduplication.enabled':
            this.deduplicationEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'internal.deduplication.list':
            this.sourceConfig = item.propertyValue;
            this.deduplicationEnabled = this.deduplicationEnabled && this.sourceConfig != null && this.sourceConfig !== '';
            break;
        }
      }
      this.enabledSources = this.sourceConfig
        .split(';')
        .map((source) => source.trim());
    });
  },
  mounted() {
    this.axios.get(`${this.$api.BASE_URL}/${this.$api.URL_VULN_SOURCES}`).then(response => {
      this.info = response.data;
      this.updateSources();
    });
  },
};
</script>

<style>
  .drag-handle {
    cursor: move;
    min-width: 25px;
  }
  .priority-value {
    display: inline-block;
    vertical-align: middle;
  }
  table {
  width: 100%;
  table-layout: fixed;
  }
  td {
  word-break: break-all;
  text-align: left;
  }
  .muted[disabled] {
  opacity: 0.5; /* Customize the opacity to indicate it is disabled */
  pointer-events: none; /* Disable pointer events on the element */
}
</style>