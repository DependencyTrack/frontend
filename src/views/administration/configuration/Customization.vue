<template>
  <div>
    <b-card no-body class="mb-4">
      <b-card-body>
        <h5 class="mb-3">
          {{ $t('admin.vulnerability_id_generation') }}
        </h5>

        <b-form-group class="mb-4">
          <c-switch
            color="primary"
            v-model="vulnIdConfig.useCustomId"
            label
            v-bind="labelIcon"
          />{{ $t('admin.use_custom_id_generator') }}
          <b-form-text class="mt-1">
            {{
              vulnIdConfig.useCustomId
                ? $t('admin.use_custom_id_generator_on_help')
                : $t('admin.use_custom_id_generator_off_help')
            }}
          </b-form-text>
        </b-form-group>

        <b-collapse :visible="vulnIdConfig.useCustomId">
          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('admin.organization_code')">
                <b-form-input
                  v-model="vulnIdConfig.orgCode"
                  placeholder="e.g. OWASP"
                  maxlength="50"
                />
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group :label="$t('admin.project_code')">
                <b-form-input
                  v-model="vulnIdConfig.projectCode"
                  placeholder="e.g. My Project Name"
                  maxlength="50"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('admin.vulnerability_id_template')">
                <b-form-input
                  v-model="vulnIdConfig.template"
                  :placeholder="
                    $t('admin.vulnerability_id_template_placeholder')
                  "
                />
                <div class="mt-2">
                  <b-badge
                    v-for="placeholder in availablePlaceholders"
                    :key="placeholder"
                    variant="outline-secondary"
                    class="mr-1 cursor-pointer"
                    @click="insertPlaceholder(placeholder)"
                    style="cursor: pointer"
                  >
                    {{ placeholder }}
                  </b-badge>
                </div>
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group :label="$t('admin.sequence_reset_policy')">
                <b-form-select
                  v-model="vulnIdConfig.resetPolicy"
                  :options="resetPolicyOptions"
                />
                <b-form-text>{{
                  $t('admin.sequence_reset_policy_help')
                }}</b-form-text>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="6">
              <b-form-group :label="$t('admin.sequence_padding')">
                <b-form-input
                  v-model.number="vulnIdConfig.sequencePadding"
                  type="number"
                  min="1"
                  max="20"
                />
                <b-form-text>{{
                  $t('admin.sequence_padding_help')
                }}</b-form-text>
              </b-form-group>
            </b-col>
          </b-row>
        </b-collapse>

        <!-- Preview -->
        <div class="preview-box mt-4 p-3 rounded">
          <div class="d-flex align-items-center">
            <div class="preview-icon mr-3">
              <span class="fa-stack fa-lg">
                <i class="fa fa-circle fa-stack-2x text-primary"></i>
                <i class="fa fa-id-badge fa-stack-1x fa-inverse"></i>
              </span>
            </div>
            <div>
              <small class="text-muted">{{ $t('admin.preview_id') }}</small>
              <div class="preview-id text-success font-weight-bold">
                {{ generatedPreviewId }}
              </div>
            </div>
            <div class="ml-auto">
              <b-button variant="link" size="sm" @click="resetVulnIdDefaults">
                <i class="fa fa-undo"></i> {{ $t('admin.reset_to_defaults') }}
              </b-button>
            </div>
          </div>
        </div>
      </b-card-body>
      <b-card-footer>
        <b-button
          variant="outline-primary"
          class="px-4"
          @click="saveVulnIdConfig"
        >
          {{ $t('message.update') }}
        </b-button>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import permissionsMixin from '../../../mixins/permissionsMixin';

export default {
  mixins: [permissionsMixin],
  components: {
    cSwitch,
  },
  data() {
    return {
      labelIcon: {
        dataOn: '✓',
        dataOff: '✕',
      },
      availablePlaceholders: [
        '{ORG_CODE}',
        '{PROJECT_NAME}',
        '{YYYY}',
        '{MM}',
        '{DD}',
        '{SEQUENCE}',
      ],
      resetPolicyOptions: [
        { value: 'NEVER', text: this.$t('admin.reset_policy_never') },
        { value: 'YEARLY', text: this.$t('admin.reset_policy_yearly') },
        { value: 'MONTHLY', text: this.$t('admin.reset_policy_monthly') },
        { value: 'DAILY', text: this.$t('admin.reset_policy_daily') },
      ],
      vulnIdConfig: {
        useCustomId: false,
        orgCode: '',
        projectCode: '',
        template: '{ORG_CODE}-{YYYY}-{SEQUENCE}',
        sequencePadding: 5,
        resetPolicy: 'YEARLY',
      },
      isLoading: false,
    };
  },
  computed: {
    generatedPreviewId() {
      if (!this.vulnIdConfig.useCustomId) {
        return 'INT-xxxx-xxxx-xxxx';
      }
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      const seq = '1'.padStart(this.vulnIdConfig.sequencePadding || 1, '0');
      const sanitizedProjectCode = this.sanitizeProjectCode(
        this.vulnIdConfig.projectCode || 'My Project Name',
      );

      let id = this.vulnIdConfig.template || '{ORG_CODE}-{YYYY}-{SEQUENCE}';
      id = id.replace(/{ORG_CODE}/g, this.vulnIdConfig.orgCode || 'OWASP');
      id = id.replace(/{PROJECT_NAME}/g, sanitizedProjectCode);
      id = id.replace(/{PROJECT_CODE}/g, sanitizedProjectCode);
      id = id.replace(/{YYYY}/g, year);
      id = id.replace(/{MM}/g, month);
      id = id.replace(/{DD}/g, day);
      id = id.replace(/{SEQUENCE}/g, seq);

      return id;
    },
  },
  methods: {
    sanitizeProjectCode(projectCode) {
      if (!projectCode || !projectCode.trim()) {
        return 'project';
      }

      // Mirrors the server-side sanitizer: non [A-Za-z0-9_-] characters are
      // removed (case preserved), duplicate separators are collapsed and
      // leading/trailing separators are trimmed.
      let sanitized = projectCode
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .replace(/([_-])[_-]+/g, '$1')
        .replace(/^[_-]+|[_-]+$/g, '');

      if (!sanitized) {
        sanitized = 'project';
      }

      return sanitized;
    },
    insertPlaceholder(placeholder) {
      const t = this.vulnIdConfig.template;
      if (t && !t.endsWith('-') && !t.endsWith('_') && !t.endsWith('/')) {
        this.vulnIdConfig.template = t + '-' + placeholder;
      } else {
        this.vulnIdConfig.template = t + placeholder;
      }
    },
    resetVulnIdDefaults() {
      this.vulnIdConfig = {
        useCustomId: false,
        orgCode: '',
        projectCode: '',
        template: '{ORG_CODE}-{YYYY}-{SEQUENCE}',
        sequencePadding: 5,
        resetPolicy: 'YEARLY',
      };
    },
    async saveVulnIdConfig() {
      if (this.vulnIdConfig.useCustomId) {
        if (!this.vulnIdConfig.orgCode || !this.vulnIdConfig.orgCode.trim()) {
          this.$toastr.w(this.$t('admin.organization_code_required'));
          return;
        }
      }
      try {
        this.isLoading = true;
        const payload = {
          useCustomId: this.vulnIdConfig.useCustomId,
          orgCode: this.vulnIdConfig.orgCode || 'DT',
          projectCode: this.vulnIdConfig.projectCode || '',
          template: this.vulnIdConfig.template,
          resetPolicy: this.vulnIdConfig.resetPolicy,
          sequencePadding: this.vulnIdConfig.sequencePadding,
        };

        const response =
          await this.$customization.updateVulnerabilityIdSettings(payload);
        if (response.status >= 200 && response.status < 300) {
          this.$toastr.s(this.$t('admin.configuration_saved'));
        }
      } catch (error) {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
        console.error('Failed to save vulnerability ID configuration:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadConfig() {
      try {
        this.isLoading = true;
        const response = await this.$customization
          .getVulnerabilityIdSettings()
          .catch((error) => {
            console.warn(
              'Failed to load vulnerability ID configuration from backend, using defaults:',
              error,
            );
            return null;
          });

        if (response && response.data) {
          this.vulnIdConfig = {
            useCustomId: response.data.useCustomId === true,
            orgCode:
              !response.data.orgCode || response.data.orgCode === 'DT'
                ? ''
                : response.data.orgCode,
            projectCode:
              !response.data.projectCode ||
              response.data.projectCode === 'project'
                ? ''
                : response.data.projectCode,
            template: response.data.template || '{ORG_CODE}-{YYYY}-{SEQUENCE}',
            sequencePadding: response.data.sequencePadding || 5,
            resetPolicy: response.data.resetPolicy || 'YEARLY',
          };
        }
      } catch (error) {
        console.warn(
          'Failed to load customization configuration, using defaults:',
          error,
        );
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.loadConfig();
  },
};
</script>

<style scoped>
.preview-box {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-id {
  font-size: 1.25rem;
  font-family: monospace;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
