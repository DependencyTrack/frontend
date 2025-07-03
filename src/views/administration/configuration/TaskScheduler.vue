<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>{{ $t('admin.task_scheduler_description') }}</p>
      <br />
      <h4>Components</h4>
      <b-validated-input-group-form-input
        id="repository_metadata_fetch"
        :label="$t('admin.task_scheduler_repository_metadata_fetch')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="repositoryMetadataFetch.value"
        :tooltip="repositoryMetadataFetch.description"
      />
      <b-validated-input-group-form-input
        id="internal_component_identification"
        :label="$t('admin.task_scheduler_internal_component_identification')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="internalComponentIdentification.value"
        :tooltip="internalComponentIdentification.description"
      />
      <br />
      <h4>Vulnerability databases synchronization</h4>
      <b-validated-input-group-form-input
        id="ghsa_mirror"
        :label="$t('admin.github_advisories')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="ghsaMirror.value"
        :tooltip="ghsaMirror.description"
      />
      <b-validated-input-group-form-input
        id="nist_mirror"
        :label="$t('admin.nvd')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="nistMirror.value"
        :tooltip="nistMirror.description"
      />
      <b-validated-input-group-form-input
        id="vulndb_mirror"
        :label="$t('admin.vulndb')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="vulndbMirror.value"
        :tooltip="vulndbMirror.description"
      />
      <b-validated-input-group-form-input
        id="osv_mirror"
        :label="$t('admin.osv_advisories')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="osvMirror.value"
        :tooltip="osvMirror.description"
      />
      <br />
      <h4>Analysis</h4>
      <b-validated-input-group-form-input
        id="portfolio_vulnerability_analysis"
        :label="$t('admin.task_scheduler_portfolio_vulnerability_analysis')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="portfolioVulnerabilityAnalysis.value"
        :tooltip="portfolioVulnerabilityAnalysis.description"
      />
      <b-validated-input-group-form-input
        id="component_analysis_cache_clear"
        :label="$t('admin.task_scheduler_component_analysis_cache_clear')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="analysisCacheClear.value"
        :tooltip="analysisCacheClear.description"
      />
      <br />
      <h4>Metrics update</h4>
      <b-validated-input-group-form-input
        id="portfolio_metrics_update"
        :label="$t('admin.task_scheduler_portfolio_metrics_update')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="portfolioMetricsUpdate.value"
        :tooltip="portfolioMetricsUpdate.description"
      />
      <b-validated-input-group-form-input
        id="vulnerability_metrics_update"
        :label="$t('admin.task_scheduler_vulnerability_metrics_update')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="vulnerabilityMetricsUpdate.value"
        :tooltip="vulnerabilityMetricsUpdate.description"
      />
      <br />
      <h4>Authentication</h4>
      <b-validated-input-group-form-input
        id="ldap_sync"
        :label="$t('admin.task_scheduler_ldap_sync')"
        input-group-size="mb-3"
        rules="required|min_value:1"
        type="number"
        v-model="ldapSync.value"
        :tooltip="ldapSync.description"
      />
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{
        $t('message.update')
      }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import BValidatedInputGroupFormInput from '@/forms/BValidatedInputGroupFormInput';
import configPropertyMixin from '@/views/administration/mixins/configPropertyMixin';
import { BButton, BCard, BCardBody, BCardFooter } from 'bootstrap-vue';

export default {
  components: {
    BValidatedInputGroupFormInput,
    BCard,
    BCardBody,
    BCardFooter,
    BButton,
  },
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  data() {
    return {
      ghsaMirror: { value: '0', description: '' },
      nistMirror: { value: '0', description: '' },
      vulndbMirror: { value: '0', description: '' },
      osvMirror: { value: '0', description: '' },
      portfolioMetricsUpdate: { value: '0', description: '' },
      vulnerabilityMetricsUpdate: { value: '0', description: '' },
      portfolioVulnerabilityAnalysis: { value: '0', description: '' },
      analysisCacheClear: { value: '0', description: '' },
      ldapSync: { value: '0', description: '' },
      repositoryMetadataFetch: { value: '0', description: '' },
      internalComponentIdentification: { value: '0', description: '' },
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      const configItems = response.data.filter(function (item) {
        return item.groupName === 'task-scheduler';
      });
      for (let i = 0; i < configItems.length; i++) {
        const item = configItems[i];
        switch (item.propertyName) {
          case 'ldap.sync.cadence':
            this.ldapSync.value = item.propertyValue;
            this.ldapSync.description = item.description;
            break;
          case 'ghsa.mirror.cadence':
            this.ghsaMirror.value = item.propertyValue;
            this.ghsaMirror.description = item.description;
            break;
          case 'osv.mirror.cadence':
            this.osvMirror.value = item.propertyValue;
            this.osvMirror.description = item.description;
            break;
          case 'nist.mirror.cadence':
            this.nistMirror.value = item.propertyValue;
            this.nistMirror.description = item.description;
            break;
          case 'vulndb.mirror.cadence':
            this.vulndbMirror.value = item.propertyValue;
            this.vulndbMirror.description = item.description;
            break;
          case 'portfolio.metrics.update.cadence':
            this.portfolioMetricsUpdate.value = item.propertyValue;
            this.portfolioMetricsUpdate.description = item.description;
            break;
          case 'vulnerability.metrics.update.cadence':
            this.vulnerabilityMetricsUpdate.value = item.propertyValue;
            this.vulnerabilityMetricsUpdate.description = item.description;
            break;
          case 'portfolio.vulnerability.analysis.cadence':
            this.portfolioVulnerabilityAnalysis.value = item.propertyValue;
            this.portfolioVulnerabilityAnalysis.description = item.description;
            break;
          case 'repository.metadata.fetch.cadence':
            this.repositoryMetadataFetch.value = item.propertyValue;
            this.repositoryMetadataFetch.description = item.description;
            break;
          case 'internal.components.identification.cadence':
            this.internalComponentIdentification.value = item.propertyValue;
            this.internalComponentIdentification.description = item.description;
            break;
          case 'component.analysis.cache.clear.cadence':
            this.analysisCacheClear.value = item.propertyValue;
            this.analysisCacheClear.description = item.description;
            break;
        }
      }
    });
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'task-scheduler',
          propertyName: 'ldap.sync.cadence',
          propertyValue: this.ldapSync.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'ghsa.mirror.cadence',
          propertyValue: this.ghsaMirror.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'osv.mirror.cadence',
          propertyValue: this.osvMirror.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'nist.mirror.cadence',
          propertyValue: this.nistMirror.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'vulndb.mirror.cadence',
          propertyValue: this.vulndbMirror.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'portfolio.metrics.update.cadence',
          propertyValue: this.portfolioMetricsUpdate.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'vulnerability.metrics.update.cadence',
          propertyValue: this.vulnerabilityMetricsUpdate.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'portfolio.vulnerability.analysis.cadence',
          propertyValue: this.portfolioVulnerabilityAnalysis.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'repository.metadata.fetch.cadence',
          propertyValue: this.repositoryMetadataFetch.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'internal.components.identification.cadence',
          propertyValue: this.internalComponentIdentification.value,
        },
        {
          groupName: 'task-scheduler',
          propertyName: 'component.analysis.cache.clear.cadence',
          propertyValue: this.analysisCacheClear.value,
        },
      ]);
    },
  },
};
</script>
