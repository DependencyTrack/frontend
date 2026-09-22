<template>
  <extension-config-form
    :key="$route.params.extensionName"
    :extension-name="$route.params.extensionName"
    extension-point-name="vuln-analyzer"
    :testable="selectedExtension ? selectedExtension.testable !== false : true"
    :display-name="
      selectedExtension ? selectedExtension.display_name : undefined
    "
  />
</template>

<script>
import ExtensionConfigForm from '@/views/components/ExtensionConfigForm.vue';

export default {
  components: {
    ExtensionConfigForm,
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
          `${this.$api.BASE_URL}/api/v2/extension-points/vuln-analyzer/extensions`,
        );
        this.extensions = response.data.items || [];
      } catch (error) {
        console.error('Failed to fetch analyzers:', error);
      }
    },
  },
};
</script>
