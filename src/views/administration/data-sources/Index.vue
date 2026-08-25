<template>
  <extension-config-form
    :key="$route.params.extensionName"
    :extension-name="$route.params.extensionName"
    :extension-point-name="extensionPointName"
    :testable="selectedExtension ? selectedExtension.testable !== false : true"
    :tabbed-array-properties="tabbedArrayProperties"
    :extra-validators="extraValidators"
    :display-name="
      selectedExtension ? selectedExtension.display_name : undefined
    "
  >
    <template #footer-actions="{ operationInProgress, hasUnsavedChanges }">
      <data-source-mirror-button
        :extension-name="$route.params.extensionName"
        :resource-path="resourcePath"
        :operation-in-progress="operationInProgress"
        :has-unsaved-changes="hasUnsavedChanges"
      />
    </template>
  </extension-config-form>
</template>

<script>
import ExtensionConfigForm from '@/views/components/ExtensionConfigForm.vue';
import DataSourceMirrorButton from '@/views/administration/data-sources/DataSourceMirrorButton.vue';

export default {
  components: {
    ExtensionConfigForm,
    DataSourceMirrorButton,
  },
  props: {
    extensionPointName: { type: String, required: true },
    resourcePath: { type: String, required: true },
  },
  data() {
    return {
      extensions: [],
    };
  },
  computed: {
    tabbedArrayProperties() {
      return this.$route.params.extensionName == 'osv' ? ['sources'] : [];
    },
    extraValidators() {
      if (this.$route.params.extensionName !== 'osv') {
        return [];
      }
      return [(config) => this.validateOsvSources(config)];
    },
    selectedExtension() {
      const name = this.$route.params.extensionName;
      if (!name) return null;
      return this.extensions.find((e) => e.name === name) || null;
    },
  },
  watch: {
    extensionPointName() {
      this.extensions = [];
      this.fetchExtensions();
    },
  },
  mounted() {
    this.fetchExtensions();
  },
  methods: {
    async fetchExtensions() {
      try {
        const response = await this.axios.get(
          `${this.$api.BASE_URL}/api/v2/extension-points/${this.extensionPointName}/extensions`,
        );
        this.extensions = response.data.items || [];
      } catch (error) {
        console.error(
          'Failed to fetch extensions for extension point:',
          this.extensionPointName,
          error,
        );
      }
    },
    validateOsvSources(config) {
      const errors = {};
      const sources = Array.isArray(config?.sources) ? config.sources : [];
      const names = sources.map((source) =>
        typeof source?.name === string ? source.name.trim() : ''
      );

      names.forEach((name, index) => {
        if (!name) {
          errors[`sources.${index}.name`] = this.$t(
            'validation.schema.required',
            { property: 'name' },
          );
        } else if (names.filter((candidate) => candidate === name).length > 1) {
          errors[`sources.${index}.name`] = this.$t('validation.schema.required');
        }

        if (sources.index?.enabled) {
          if (Array.isArray(sources[index].ecosystems) || sources[index].ecosystems.length === 0) {
            errors[`sources.${index}.ecosystems`] = this.$t(
              'validation.schema.min_items',
              { limit: 1 },
            );
          }
        }
      });
      return errors;
    }
  },
};
</script>
