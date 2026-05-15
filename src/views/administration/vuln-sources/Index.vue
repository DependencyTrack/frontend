<template>
  <extension-config-form
    :key="$route.params.extensionName"
    :extension-name="$route.params.extensionName"
    extension-point-name="vuln-data-source"
    :testable="selectedExtension ? selectedExtension.testable !== false : true"
  >
    <template #footer-actions="{ operationInProgress, hasUnsavedChanges }">
      <vuln-source-mirror-button
        :extension-name="$route.params.extensionName"
        :operation-in-progress="operationInProgress"
        :has-unsaved-changes="hasUnsavedChanges"
      />
    </template>
  </extension-config-form>
</template>

<script>
import ExtensionConfigForm from '@/views/components/ExtensionConfigForm.vue';
import VulnSourceMirrorButton from '@/views/administration/vuln-sources/VulnSourceMirrorButton.vue';

export default {
  components: {
    ExtensionConfigForm,
    VulnSourceMirrorButton,
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
  mounted() {
    this.fetchExtensions();
  },
  methods: {
    async fetchExtensions() {
      try {
        const response = await this.axios.get(
          `${this.$api.BASE_URL}/api/v2/extension-points/vuln-data-source/extensions`,
        );
        this.extensions = response.data.items || [];
      } catch (error) {
        console.error('Failed to fetch vulnerability sources:', error);
      }
    },
  },
};
</script>
