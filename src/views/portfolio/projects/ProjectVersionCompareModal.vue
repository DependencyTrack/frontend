<template>
  <b-modal
    id="projectVersionCompareModal"
    size="lg"
    no-stacking
    hide-header-close
    :title="$t('message.compare_versions')"
    @hide="resetValues()"
  >
    <b-card>
      <div class="h5 mb-2 mt-1">
        Project Version: {{ this.project.version }}
      </div>

      <b-input-group-form-select
        id="input-repository-type"
        required="true"
        v-model="selectedVersion"
        :options="sortedVersions"
        :label="$t('message.comparison_version')"
      />
      <div class="mb-1">
        <b-button
          @click="compareVersions()"
          size="md"
          class="mr-1"
          variant="outline-primary"
          >{{ $t('message.compare') }}</b-button
        >
        <b-button size="md" variant="secondary" @click="cancel()">{{
          $t('message.close')
        }}</b-button>
      </div>

      <b-tabs
        class="body-bg-color"
        style="border-left: 0; border-right: 0; border-top: 0"
      >
        <b-tab
          ref="overview"
          class="body-bg-color overview-chart"
          style="border-left: 0; border-right: 0; border-top: 0"
          active
        >
          <template v-slot:title
            ><i class="fa fa-line-chart"></i>
            {{ $t('message.overview') }}
          </template>
          <bootstrap-table
            ref="overviewTable"
            :columns="overviewColumns"
            :data="this.consolidatedMetrics"
          >
          </bootstrap-table>
        </b-tab>
        <b-tab
          ref="components"
          class="body-bg-color overview-chart"
          style="border-left: 0; border-right: 0; border-top: 0"
        >
          <template v-slot:title
            ><i class="fa fa-cubes"></i>
            {{ $t('message.components') }}
          </template>
          <b-button
            @click="downloadCSV()"
            size="md"
            class="m-1"
            variant="outline-primary"
            v-show="this.consolidatedComponents.length > 0"
            >{{ $t('message.download_comparison') }}</b-button
          >
          <bootstrap-table
            ref="table"
            :columns="columns"
            :data="this.consolidatedComponents"
          >
          </bootstrap-table>
        </b-tab>
      </b-tabs>
      <p></p>
    </b-card>
    <template v-slot:modal-footer>
      <div class="w-100"></div>
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormSelect from '../../../forms/BInputGroupFormSelect';
import permissionsMixin from '../../../mixins/permissionsMixin';
import availableClassifiersMixin from '@/mixins/availableClassifiersMixin';
import availableCollectionLogicsMixin from '@/mixins/availableCollectionLogicsMixin';
import { get } from 'lodash-es';

export default {
  name: 'ProjectVersionCompareModal',
  mixins: [
    permissionsMixin,
    availableClassifiersMixin,
    availableCollectionLogicsMixin,
  ],
  components: {
    BInputGroupFormSelect,
  },
  props: {
    project: Object,
  },
  data() {
    return {
      metricKeys: [
        'critical',
        'high',
        'medium',
        'low',
        'vulnerabilities',
        'vulnerableComponents',
        'components',
        'policyViolationsTotal',
      ],
      comparisonProject: null,
      comparisonComponents: [],
      projectComponents: [],
      consolidatedComponents: [],
      consolidatedMetrics: [],
      selectedVersion: '',
      readOnlyProjectName: '',
      readOnlyProjectVersion: '',
      sortedVersions: null,
      overviewColumns: [
        {
          title: this.$t('message.metric'),
          field: 'metric',
          sortable: false,
        },
        {
          title: this.$t('message.project_version'),
          field: 'original',
          sortable: false,
        },
        {
          title: this.$t('message.comparison_version'),
          field: 'compare',
          sortable: false,
        },
      ],
      columns: [
        {
          title: this.$t('message.component'),
          field: 'name',
          sortable: false,
        },
        {
          title: this.$t('message.project_version'),
          field: 'original',
          sortable: false,
        },
        {
          title: this.$t('message.comparison_version'),
          field: 'compare',
          sortable: false,
        },
      ],
    };
  },
  beforeMount() {
    this.$root.$on('initializeProjectVersionCompareModal', async () => {
      this.selectedVersion = '';
      this.sortedVersions = this.sortedProjectVersions();
      this.$root.$emit('bv::show::modal', 'projectVersionCompareModal');
    });
  },
  watch: {
    comparisonComponents() {
      this.consolidateComponents();
    },
    projectComponents() {
      this.consolidateComponents();
    },
    comparisonProject() {
      this.consolidateMetrics();
    },
  },
  methods: {
    cancel() {
      this.$root.$emit('bv::hide::modal', 'projectVersionCompareModal');
    },
    downloadCSV() {
      const header = [
        this.$t('message.component'),
        `${this.$t('message.project_version')}:${this.project.version}`,
        `${this.$t('message.comparison_version')}:${this.selectedVersion}`,
      ];
      const objectKeys = ['name', 'original', 'compare'];
      const csv = [
        header.join(','),
        ...this.consolidatedComponents.map((row) =>
          objectKeys.map((header) => get(row, header)).join(','),
        ),
      ].join('\r\n');

      const url = window.URL.createObjectURL(new Blob([csv]));
      const link = document.createElement('a');
      link.href = url;
      let filename = 'componentTable.csv';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    },
    resetValues() {
      this.consolidatedComponents = [];
      this.projectComponents = [];
      this.comparisonComponents = [];
      this.comparisonProject = [];
      this.consolidatedMetrics = [];
    },
    consolidateMetrics() {
      this.metricKeys.forEach((key) => {
        let niceKeyName = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (first) => first.toUpperCase());
        try {
          this.consolidatedMetrics.push({
            metric: niceKeyName,
            original: this.project.metrics?.[key] ?? 0,
            compare: this.comparisonProject.metrics?.[key] ?? 0,
          });
        } catch (e) {
          console.log(e);
          return e;
        }
      });
    },
    consolidateComponents() {
      if (
        this.comparisonComponents.length > 0 &&
        this.projectComponents.length > 0
      ) {
        let map = new Map();

        this.projectComponents.map((item) => {
          map.set(item.name, {
            name: item.name,
            original: item.version,
            compare: '',
          });
        });

        this.comparisonComponents.map((item) => {
          if (!map.has(item.name)) {
            map.set(item.name, {
              name: item.name,
              original: '',
              compare: item.version,
            });
          }
          map.get(item.name).compare = item.version;
        });

        this.consolidatedComponents = [...map.values()];
      }
    },
    initComparissonProject(uuid) {
      let projectUrl = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${uuid}`;
      return this.axios
        .get(projectUrl)
        .catch((error) => {
          if (error.response.status === 403) {
            this.$router.replace({ name: 'Projects' });
          }
        })
        .then((response) => {
          this.comparisonProject = response.data;
        });
    },
    compareVersions() {
      this.resetValues();
      let uuid = this.project.versions.find(
        (obj) => obj.version === this.selectedVersion,
      ).uuid;

      this.initComparissonProject(uuid);
      this.axios
        .get(
          `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/project/${this.project.uuid}`,
        )
        .then((response) => {
          if (response.data) {
            this.projectComponents = response.data.sort((a, b) => {
              const nameA = (a.name ?? '').toString();
              const nameB = (b.name ?? '').toString();
              return nameA.localeCompare(nameB);
            });
          }
        });

      this.axios
        .get(`${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/project/${uuid}`)
        .then((response) => {
          if (response.data) {
            this.comparisonComponents = response.data.sort((a, b) => {
              const nameA = (a.name ?? '').toString();
              const nameB = (b.name ?? '').toString();
              return nameA.localeCompare(nameB);
            });
          }
        });
    },
    sortedProjectVersions() {
      let versions = this.project.versions.map((obj) => obj.version);
      versions = versions.filter((version) => version !== this.project.version);
      versions.sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if (aParts[i] > bParts[i]) return 1;
          if (aParts[i] < bParts[i]) return -1;
        }
        return 0;
      });
      return versions;
    },
  },
};
</script>

<style scoped>
.tab-content .tab-pane {
  padding: 0 !important;
}

.tab-content {
  border: 0 !important;
}

.card {
  border: 0;
  padding: 0;
  margin-bottom: 0;
}
</style>
