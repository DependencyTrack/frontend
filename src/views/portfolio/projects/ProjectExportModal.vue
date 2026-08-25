<template>
  <b-modal
    id="projectExportModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :no-close-on-backdrop="isDownloading"
    :no-close-on-esc="isDownloading"
    :title="$t('message.export_project')"
  >
    <b-form-group
      id="fieldset-export-type"
      :label="this.$t('message.type')"
      label-for="input-export-type"
      :description="typeDescription"
    >
      <b-form-select
        id="input-export-type"
        v-model="type"
        :options="typeOptions"
      />
    </b-form-group>
    <b-form-group
      v-if="isFormatSelectable"
      id="fieldset-export-format"
      :label="this.$t('message.format')"
      label-for="input-export-format"
    >
      <b-form-select
        id="input-export-format"
        v-model="format"
        :options="formatOptions"
      />
    </b-form-group>
    <b-form-group
      id="fieldset-export-version"
      :label="this.$t('message.cyclonedx_version')"
      label-for="input-export-version"
    >
      <b-form-select
        id="input-export-version"
        v-model="version"
        :options="versionOptions"
      />
    </b-form-group>

    <template v-slot:modal-footer="{ cancel }">
      <b-button
        size="md"
        variant="secondary"
        :disabled="isDownloading"
        @click="cancel()"
        >{{ $t('message.cancel') }}</b-button
      >
      <b-button
        size="md"
        variant="primary"
        :disabled="isDownloading"
        @click="download()"
      >
        <b-spinner v-if="isDownloading" small class="mr-1"></b-spinner>
        <span v-else class="fa fa-download mr-1"></span>
        {{ $t('message.download') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import common from '@/shared/common';
import permissionsMixin from '@/mixins/permissionsMixin';

const CYCLONEDX_VERSIONS = [
  { value: '1.0', formats: ['XML'] },
  { value: '1.1', formats: ['XML'] },
  { value: '1.2', formats: ['XML', 'JSON'] },
  { value: '1.3', formats: ['XML', 'JSON'] },
  { value: '1.4', formats: ['XML', 'JSON'] },
  { value: '1.5', formats: ['XML', 'JSON'] },
  { value: '1.6', formats: ['XML', 'JSON'] },
  { value: '1.7', formats: ['XML', 'JSON'] },
];

export default {
  name: 'ProjectExportModal',
  mixins: [permissionsMixin],
  props: {
    uuid: String,
  },
  data() {
    return {
      type: 'inventory',
      format: 'JSON',
      isDownloading: false,
      version: null,
      formatOptions: ['JSON', 'XML'],
    };
  },
  computed: {
    typeOptions() {
      const vulnPermissions = [
        this.PERMISSIONS.VIEW_VULNERABILITY,
        this.PERMISSIONS.VULNERABILITY_ANALYSIS,
        this.PERMISSIONS.VULNERABILITY_ANALYSIS_READ,
      ];
      const options = [];
      if (this.isPermitted(this.PERMISSIONS.VIEW_PORTFOLIO)) {
        options.push({
          value: 'inventory',
          text: this.$t('message.inventory'),
        });
      }
      if (this.isPermitted(vulnPermissions)) {
        options.push(
          {
            value: 'withVulnerabilities',
            text: this.$t('message.inventory_with_vulnerabilities'),
          },
          { value: 'vdr', text: this.$t('message.vdr') },
          { value: 'vex', text: this.$t('message.vex') },
        );
      }
      return options;
    },
    typeDescription() {
      if (this.type === 'vdr') {
        return this.$t('message.export_vdr_tooltip');
      }
      if (this.type === 'vex') {
        return this.$t('message.export_vex_tooltip');
      }
      return null;
    },
    isFormatSelectable() {
      return this.type !== 'vex';
    },
    effectiveFormat() {
      return this.isFormatSelectable ? this.format : 'JSON';
    },
    versionOptions() {
      return [
        { value: null, text: this.$t('message.default') },
        ...CYCLONEDX_VERSIONS.filter((v) =>
          v.formats.includes(this.effectiveFormat),
        ).map((v) => v.value),
      ];
    },
  },
  watch: {
    effectiveFormat() {
      if (
        this.version &&
        !this.versionOptions.some((v) => v.value === this.version)
      ) {
        this.version = null;
      }
    },
  },
  methods: {
    resetValues: function () {
      this.type = 'inventory';
      this.format = 'JSON';
      this.version = null;
      this.isDownloading = false;
    },
    download: function () {
      const isVex = this.type === 'vex';
      const resource = isVex ? this.$api.URL_VEX : this.$api.URL_BOM;
      const params = { download: 'true', version: this.version };
      if (!isVex) {
        params.format = this.effectiveFormat;
        params.variant = this.type;
      }
      this.isDownloading = true;
      common
        .downloadAttachment(
          this.axios,
          `${this.$api.BASE_URL}/${resource}/cyclonedx/project/${this.uuid}`,
          params,
          `${isVex ? 'vex' : 'bom'}.${this.effectiveFormat.toLowerCase()}`,
        )
        .then(() => {
          this.$root.$emit('bv::hide::modal', 'projectExportModal');
        })
        .finally(() => {
          this.isDownloading = false;
        });
    },
  },
};
</script>
