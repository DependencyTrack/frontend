<template>
  <b-card no-body>
    <template #header>
      {{ header }}
      <b-badge v-if="hasUnsavedChanges" variant="info" class="ml-2">
        {{ $t('message.unsaved_changes_badge') }}
      </b-badge>
    </template>
    <b-card-body>
      <b-form-group
        :label="$t('admin.metrics')"
        label-size="lg"
        label-class="font-weight-bold pt-0 mb-0"
      >
        <b-form-group :label="$t('admin.retention')">
          <b-form-text class="mb-2">
            {{ $t('admin.metrics_retention_help') }}
          </b-form-text>
          <div class="d-flex align-items-center">
            <b-form-input
              type="range"
              v-model="metricsRetentionDays"
              min="1"
              max="365"
              step="1"
              class="flex-grow-1"
            />
            <span
              class="ml-2 font-weight-bold"
              style="min-width: 6em; text-align: right; white-space: nowrap"
              >{{ metricsRetentionDays }} {{ $t('admin.days') }}</span
            >
          </div>
        </b-form-group>
      </b-form-group>
      <b-form-group
        :label="$t('message.projects')"
        label-size="lg"
        label-class="font-weight-bold pt-0 mb-0"
      >
        <b-form-group>
          <label class="d-flex align-items-center mb-0">
            <c-switch
              color="primary"
              v-model="enableProjectRetention"
              label
              v-bind="switchLabelIcon"
            />
            <span class="ml-1">{{ $t('admin.project_retention_enable') }}</span>
          </label>
          <b-form-text>
            {{ $t('admin.project_retention_enable_help') }}
          </b-form-text>
        </b-form-group>
        <div v-if="enableProjectRetention">
          <b-form-group :label="$t('message.project_retention_type')">
            <b-form-text class="mb-2">
              {{ $t('admin.project_retention_type_help') }}
            </b-form-text>
            <b-form-select
              v-model="projectRetentionTypeSelected"
              :options="projectRetentionTypeOptions"
              :state="projectRetentionTypeState"
            />
          </b-form-group>
          <b-form-group v-if="projectRetentionTypeSelected === 'AGE'">
            <b-form-text class="mb-2">
              {{ $t('admin.project_retention_days_help') }}
            </b-form-text>
            <div class="d-flex align-items-center">
              <b-form-input
                type="range"
                v-model="projectRetentionDays"
                min="1"
                max="365"
                step="1"
                class="flex-grow-1"
              />
              <span
                class="ml-2 font-weight-bold"
                style="min-width: 6em; text-align: right; white-space: nowrap"
                >{{ projectRetentionDays }} {{ $t('admin.days') }}</span
              >
            </div>
          </b-form-group>
          <b-form-group v-if="projectRetentionTypeSelected === 'VERSIONS'">
            <b-form-text class="mb-2">
              {{ $t('admin.project_retention_versions_help') }}
            </b-form-text>
            <div class="d-flex align-items-center">
              <b-form-input
                type="range"
                v-model="projectRetentionVersions"
                min="1"
                max="100"
                step="1"
                class="flex-grow-1"
              />
              <span
                class="ml-2 font-weight-bold"
                style="min-width: 6em; text-align: right; white-space: nowrap"
                >{{ projectRetentionVersions }}</span
              >
            </div>
          </b-form-group>
        </div>
      </b-form-group>
      <b-form-group
        :label="$t('admin.tags')"
        label-size="lg"
        label-class="font-weight-bold pt-0 mb-0"
      >
        <label class="d-flex align-items-center mb-0">
          <c-switch
            color="primary"
            v-model="tagsDeleteUnused"
            label
            v-bind="switchLabelIcon"
          />
          <span class="ml-1">{{ $t('admin.tags_delete_unused') }}</span>
        </label>
        <b-form-text>
          {{ $t('admin.tags_delete_unused_help') }}
        </b-form-text>
      </b-form-group>
    </b-card-body>
    <b-card-footer>
      <b-button
        variant="outline-primary"
        class="px-4"
        :disabled="!hasUnsavedChanges || !isValid"
        @click="saveChanges"
        ><i class="fa fa-floppy-o" /> {{ $t('message.update') }}</b-button
      >
      <b-button
        variant="outline-danger"
        class="ml-2"
        :disabled="!hasUnsavedChanges"
        @click="resetChanges"
      >
        <i class="fa fa-undo" />
        {{ $t('message.reset') }}
      </b-button>
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
      metricsRetentionDays: 90,
      enableProjectRetention: null,
      projectRetentionTypeSelected: '',
      projectRetentionDays: 30,
      projectRetentionVersions: 5,
      tagsDeleteUnused: null,
      initialSnapshot: '',
      switchLabelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
    };
  },
  computed: {
    projectRetentionTypeOptions() {
      return [
        { value: '', text: this.$t('message.select'), disabled: true },
        { value: 'AGE', text: this.$t('message.age') },
        { value: 'VERSIONS', text: this.$t('admin.versions') },
      ];
    },
    formData() {
      return {
        metricsRetentionDays: this.metricsRetentionDays,
        enableProjectRetention: this.enableProjectRetention,
        projectRetentionTypeSelected: this.projectRetentionTypeSelected,
        projectRetentionDays: this.projectRetentionDays,
        projectRetentionVersions: this.projectRetentionVersions,
        tagsDeleteUnused: this.tagsDeleteUnused,
      };
    },
    hasUnsavedChanges() {
      if (!this.initialSnapshot) return false;
      return JSON.stringify(this.formData) !== this.initialSnapshot;
    },
    isValid() {
      if (!this.enableProjectRetention) return true;
      return !!this.projectRetentionTypeSelected;
    },
    projectRetentionTypeState() {
      if (!this.enableProjectRetention) return null;
      return this.projectRetentionTypeSelected ? null : false;
    },
  },
  methods: {
    resetChanges() {
      if (!this.initialSnapshot) return;
      const snapshot = JSON.parse(this.initialSnapshot);
      this.metricsRetentionDays = snapshot.metricsRetentionDays;
      this.enableProjectRetention = snapshot.enableProjectRetention;
      this.projectRetentionTypeSelected = snapshot.projectRetentionTypeSelected;
      this.projectRetentionDays = snapshot.projectRetentionDays;
      this.projectRetentionVersions = snapshot.projectRetentionVersions;
      this.tagsDeleteUnused = snapshot.tagsDeleteUnused;
    },
    saveChanges: async function () {
      const prev = JSON.parse(this.initialSnapshot || '{}');

      const projectRetentionEnabled =
        this.enableProjectRetention && !prev.enableProjectRetention;
      const tagDeletionEnabled =
        this.tagsDeleteUnused && !prev.tagsDeleteUnused;
      const metricsRetentionReduced =
        parseInt(this.metricsRetentionDays) <
        parseInt(prev.metricsRetentionDays);

      const retentionStrategyChanged =
        this.enableProjectRetention &&
        prev.enableProjectRetention &&
        this.projectRetentionTypeSelected !== prev.projectRetentionTypeSelected;
      const retentionThresholdReduced =
        this.enableProjectRetention &&
        prev.enableProjectRetention &&
        ((this.projectRetentionTypeSelected === 'AGE' &&
          parseInt(this.projectRetentionDays) <
            parseInt(prev.projectRetentionDays)) ||
          (this.projectRetentionTypeSelected === 'VERSIONS' &&
            parseInt(this.projectRetentionVersions) <
              parseInt(prev.projectRetentionVersions)));

      const needsConfirmation =
        projectRetentionEnabled ||
        tagDeletionEnabled ||
        metricsRetentionReduced ||
        retentionStrategyChanged ||
        retentionThresholdReduced;

      if (needsConfirmation) {
        const confirmed = await this.$bvModal.msgBoxConfirm(
          this.$t('admin.maintenance_destructive_confirm_message'),
          {
            title: this.$t('admin.maintenance_destructive_confirm_title'),
            size: 'md',
            okVariant: 'danger',
            okTitle: this.$t('message.update'),
            cancelTitle: this.$t('message.cancel'),
            centered: true,
          },
        );
        if (!confirmed) return;
      }

      this.updateConfigProperties(
        [
          {
            groupName: 'maintenance',
            propertyName: 'metrics.retention.days',
            propertyValue: this.metricsRetentionDays,
          },
          {
            groupName: 'maintenance',
            propertyName: 'projects.retention.type',
            propertyValue: this.enableProjectRetention
              ? this.projectRetentionTypeSelected
              : null,
          },
          {
            groupName: 'maintenance',
            propertyName: 'projects.retention.days',
            propertyValue:
              this.projectRetentionTypeSelected === 'AGE'
                ? this.projectRetentionDays
                : null,
          },
          {
            groupName: 'maintenance',
            propertyName: 'projects.retention.versions',
            propertyValue:
              this.projectRetentionTypeSelected === 'VERSIONS'
                ? this.projectRetentionVersions
                : null,
          },
          {
            groupName: 'maintenance',
            propertyName: 'tags.delete.unused',
            propertyValue: this.tagsDeleteUnused,
          },
        ].filter(
          (prop) =>
            // NB: Integer properties can not be null.
            // If they're not applicable per configured retention type,
            // simply omit them instead of sending null.
            prop.propertyValue !== null ||
            ![
              'projects.retention.days',
              'projects.retention.versions',
            ].includes(prop.propertyName),
        ),
      ).then((success) => {
        if (success) {
          this.initialSnapshot = JSON.stringify(this.formData);
        }
      });
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(
        (item) => item.groupName === 'maintenance',
      );
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'metrics.retention.days':
            this.metricsRetentionDays = item.propertyValue;
            break;
          case 'projects.retention.type':
            this.enableProjectRetention =
              item.propertyValue == null ? false : true;
            this.projectRetentionTypeSelected = item.propertyValue;
            break;
          case 'projects.retention.days':
            this.projectRetentionDays = item.propertyValue;
            break;
          case 'projects.retention.versions':
            this.projectRetentionVersions = item.propertyValue;
            break;
          case 'tags.delete.unused':
            this.tagsDeleteUnused = common.toBoolean(item.propertyValue);
            break;
        }
      }
      this.$nextTick(() => {
        this.initialSnapshot = JSON.stringify(this.formData);
      });
    });
  },
};
</script>
