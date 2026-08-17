<template>
  <extension-config-form
    :key="$route.params.extensionName"
    :extension-name="$route.params.extensionName"
    :extension-point-name="extensionPointName"
    :testable="selectedExtension ? selectedExtension.testable !== false : true"
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
  },
};
</script>
