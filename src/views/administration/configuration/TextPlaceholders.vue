<template>
  <b-card no-body>
    <b-card-body>
      <b-form-group class="mb-3">
        <c-switch
          color="primary"
          v-model="draft.enabled"
          label
          v-bind="labelIcon"
        />{{ $t('admin.enable_text_placeholders') }}
        <small class="text-muted d-block mt-1">{{
          $t('admin.text_placeholders_desc')
        }}</small>
      </b-form-group>

      <b-form-group :label="$t('admin.placeholder_description')">
        <b-form-textarea v-model="draft.descriptionPlaceholder" rows="3" />
      </b-form-group>
      <b-form-group :label="$t('admin.placeholder_detail')">
        <b-form-textarea v-model="draft.detailPlaceholder" rows="2" />
      </b-form-group>
      <b-form-group :label="$t('admin.placeholder_recommendation')">
        <b-form-textarea v-model="draft.recommendationPlaceholder" rows="3" />
      </b-form-group>
      <b-form-group :label="$t('admin.placeholder_references')">
        <b-form-textarea v-model="draft.referencesPlaceholder" rows="2" />
      </b-form-group>
      <b-form-group :label="$t('admin.placeholder_comment')">
        <b-form-textarea v-model="draft.commentPlaceholder" rows="2" />
      </b-form-group>
      <b-form-group :label="$t('admin.placeholder_analysis_details')">
        <b-form-textarea v-model="draft.analysisDetailsInstruction" rows="6" />
      </b-form-group>
    </b-card-body>

    <b-card-footer>
      <b-button
        variant="outline-primary"
        class="px-4"
        :disabled="!isDirty"
        @click="saveSettings"
      >
        {{ $t('message.update') }}
      </b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';

export default {
  name: 'TextPlaceholders',
  components: {
    cSwitch,
  },
  data() {
    return {
      labelIcon: { dataOn: '✓', dataOff: '✕' },
      draft: {
        enabled: false,
        descriptionPlaceholder: '',
        detailPlaceholder: '',
        recommendationPlaceholder: '',
        referencesPlaceholder: '',
        commentPlaceholder: '',
        analysisDetailsInstruction: '',
      },
      isDirty: false,
      isLoading: false,
    };
  },
  methods: {
    async saveSettings() {
      try {
        const response =
          await this.$customization.updateTextPlaceholderSettings({
            ...this.draft,
          });
        if (response.status >= 200 && response.status < 300) {
          this.$toastr.s(this.$t('admin.configuration_saved'));
          this.isDirty = false;
        }
      } catch (error) {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
        console.error('Failed to save text placeholder settings:', error);
      }
    },
    async loadConfig() {
      this.isLoading = true;
      try {
        const response = await this.$customization.getTextPlaceholderSettings();
        if (response && response.data) {
          this.draft = {
            enabled: response.data.enabled === true,
            descriptionPlaceholder: response.data.descriptionPlaceholder || '',
            detailPlaceholder: response.data.detailPlaceholder || '',
            recommendationPlaceholder:
              response.data.recommendationPlaceholder || '',
            referencesPlaceholder: response.data.referencesPlaceholder || '',
            commentPlaceholder: response.data.commentPlaceholder || '',
            analysisDetailsInstruction:
              response.data.analysisDetailsInstruction || '',
          };
        }
      } catch (error) {
        console.warn(
          'Failed to load text placeholder settings, using defaults:',
          error,
        );
      } finally {
        this.$nextTick(() => {
          this.isDirty = false;
          this.isLoading = false;
        });
      }
    },
  },
  watch: {
    draft: {
      deep: true,
      handler() {
        if (!this.isLoading) {
          this.isDirty = true;
        }
      },
    },
  },
  mounted() {
    this.loadConfig();
  },
};
</script>
