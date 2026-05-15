<template>
  <b-card no-body>
    <template v-if="cardHeader" #header>
      {{ cardHeader }}
      <b-badge v-if="hasUnsavedChanges" variant="info" class="ml-2">
        {{ $t('message.unsaved_changes_badge') }}
      </b-badge>
    </template>
    <b-form @submit="onSubmit">
      <b-card-body>
        <b-alert v-if="loadError" variant="danger" show>
          {{ loadError }}
        </b-alert>

        <div v-if="!loadError && schema">
          <div
            v-for="(propSchema, propName) in schema.properties"
            :key="propName"
            class="form-group"
          >
            <json-schema-form-field
              :schema="enrichSchema(propSchema, propName, schema)"
              :property-name="propName"
              :value="formData[propName]"
              :validation-error="getValidationError(propName)"
              :validation-errors="nestedErrorMap[propName] || {}"
              @input="onFieldChange(propName, $event)"
            />
          </div>
        </div>

        <div
          v-if="!schema && !loadError"
          class="extension-config-form__skeleton"
        >
          <div class="skeleton-line skeleton-line--label"></div>
          <div class="skeleton-line skeleton-line--field"></div>
          <div class="skeleton-line skeleton-line--label"></div>
          <div class="skeleton-line skeleton-line--field"></div>
          <div class="skeleton-line skeleton-line--label"></div>
          <div class="skeleton-line skeleton-line--field"></div>
          <span class="sr-only">{{ $t('message.loading') }}</span>
        </div>
      </b-card-body>
      <b-card-footer v-if="!hideSubmitButton">
        <b-button
          variant="primary"
          type="submit"
          :disabled="isOperationInProgress || !schema || !hasUnsavedChanges"
        >
          <b-spinner v-if="isSavingInProgress" small />
          <i v-else class="fa fa-save" />
          {{ $t('admin.save') }}
        </b-button>
        <b-button
          v-if="testable"
          variant="outline-secondary"
          :disabled="isOperationInProgress || !schema"
          class="ml-2"
          @click="testConfig"
        >
          <b-spinner v-if="isTestInProgress" small />
          <i v-else class="fa fa-flask" />
          {{ $t('admin.test') }}
        </b-button>
        <b-button
          variant="outline-danger"
          :disabled="isOperationInProgress || !hasUnsavedChanges"
          class="ml-2"
          @click="resetChanges"
        >
          <i class="fa fa-undo" />
          {{ $t('message.reset') }}
        </b-button>
        <slot
          name="footer-actions"
          :operation-in-progress="isOperationInProgress"
          :has-unsaved-changes="hasUnsavedChanges"
        />
      </b-card-footer>
    </b-form>

    <b-modal
      id="testResultsModal"
      ref="testResultsModal"
      :title="$t('admin.test_results')"
      ok-only
      :ok-title="$t('message.close')"
    >
      <div v-if="testResults">
        <p v-if="testResults.checks && testResults.checks.length" class="mb-3">
          {{ testResultsSummary }}
        </p>
        <b-alert
          v-for="(check, index) in sortedChecks"
          :key="index"
          :variant="getCheckVariant(check.status)"
          show
          class="mb-2"
        >
          <i :class="getCheckIcon(check.status)" class="mr-2"></i>
          <span v-if="check.status === 'PASSED'">
            {{ $t('admin.test_check_passed', { name: check.name }) }}
          </span>
          <span v-else-if="check.status === 'FAILED'">
            {{
              $t('admin.test_check_failed', {
                name: check.name,
                message: check.message,
              })
            }}
          </span>
          <span v-else-if="check.status === 'SKIPPED'">
            {{ $t('admin.test_check_skipped', { name: check.name }) }}
          </span>
        </b-alert>
      </div>
    </b-modal>
  </b-card>
</template>

<script>
import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import common from '../../shared/common';
import JsonSchemaFormField from './JsonSchemaFormField.vue';
import {
  enrichSchema,
  getDefaultValue,
  buildNestedValidationErrorMap,
} from '@/shared/jsonSchemaForm';

const CHECK_STATUS_ORDER = { FAILED: 0, SKIPPED: 1, PASSED: 2 };

export default {
  components: {
    JsonSchemaFormField,
  },
  props: {
    extensionPointName: {
      type: String,
      required: false,
    },
    extensionName: {
      type: String,
      required: true,
    },
    configSchemaUrl: {
      type: String,
      required: false,
    },
    initialConfig: {
      type: Object,
      required: false,
      default: null,
    },
    hideSubmitButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    testable: {
      type: Boolean,
      required: false,
      default: true,
    },
    header: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      schema: null,
      formData: {},
      initialSnapshot: '',
      validationErrors: {},
      isSavingInProgress: false,
      isTestInProgress: false,
      testResults: null,
      loadError: null,
      ajv: null,
      compiledValidator: null,
      abortController: null,
    };
  },
  computed: {
    cardHeader() {
      if (this.header !== undefined) {
        return this.header;
      }
      return this.schema?.title || common.titleCase(this.extensionName);
    },
    normalizedFormData() {
      return this.normalizeFormData(this.formData);
    },
    isOperationInProgress() {
      return this.isSavingInProgress || this.isTestInProgress;
    },
    hasUnsavedChanges() {
      if (!this.initialSnapshot) {
        return false;
      }
      return JSON.stringify(this.normalizedFormData) !== this.initialSnapshot;
    },
    schemaSourceKey() {
      return [
        this.extensionPointName,
        this.extensionName,
        this.configSchemaUrl,
      ].join('|');
    },
    nestedErrorMap() {
      return buildNestedValidationErrorMap(this.validationErrors);
    },
    sortedChecks() {
      if (!this.testResults?.checks) {
        return [];
      }
      return this.testResults.checks.slice().sort((a, b) => {
        const ra = CHECK_STATUS_ORDER[a.status] ?? 99;
        const rb = CHECK_STATUS_ORDER[b.status] ?? 99;
        return ra - rb;
      });
    },
    testResultsSummary() {
      if (!this.testResults?.checks) {
        return '';
      }
      const counts = { PASSED: 0, FAILED: 0, SKIPPED: 0 };
      this.testResults.checks.forEach((c) => {
        if (counts[c.status] !== undefined) {
          counts[c.status] += 1;
        }
      });
      return this.$t('admin.json_schema_form.test_summary', {
        passed: counts.PASSED,
        failed: counts.FAILED,
        skipped: counts.SKIPPED,
      });
    },
  },
  watch: {
    schemaSourceKey() {
      this.reloadSchemaAndConfig();
    },
    // Parents (e.g. Alerts.vue) may recompute initialConfig on every render,
    // producing a new object reference even when the content is unchanged.
    // Compare by value to avoid reload loops.
    initialConfig(newVal, oldVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        this.reloadSchemaAndConfig();
      }
    },
  },
  async mounted() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateFormats: true,
    });
    addFormats(this.ajv);
    await this.fetchSchemaAndConfig();
  },
  beforeDestroy() {
    this.abortController?.abort();
  },
  methods: {
    enrichSchema,
    reloadSchemaAndConfig() {
      this.schema = null;
      this.compiledValidator = null;
      this.formData = {};
      this.initialSnapshot = '';
      this.validationErrors = {};
      this.loadError = null;
      this.fetchSchemaAndConfig();
    },
    async fetchSchemaAndConfig() {
      this.abortController?.abort();
      const controller = new AbortController();
      this.abortController = controller;

      try {
        const schemaUrl =
          this.configSchemaUrl ||
          `${this.$api.BASE_URL}/api/v2/extension-points/${this.extensionPointName}/extensions/${this.extensionName}/config-schema`;

        let schemaResponse, configData;
        if (this.initialConfig !== null) {
          schemaResponse = await this.axios.get(schemaUrl, {
            signal: controller.signal,
          });
          configData = this.initialConfig;
        } else {
          const configUrl = `${this.$api.BASE_URL}/api/v2/extension-points/${this.extensionPointName}/extensions/${this.extensionName}/config`;
          const [schemaResp, configResponse] = await Promise.all([
            this.axios.get(schemaUrl, { signal: controller.signal }),
            this.axios.get(configUrl, { signal: controller.signal }),
          ]);
          schemaResponse = schemaResp;
          configData = configResponse.data.config || {};
        }

        this.schema = schemaResponse.data;
        this.formData = this.initializeFormData(configData);
        this.initialSnapshot = JSON.stringify(this.normalizedFormData);
      } catch (err) {
        if (controller.signal.aborted || this.axios.isCancel?.(err)) {
          return;
        }
        console.error(`Failed to load schema or config: ${err}`);
        this.loadError = `Failed to load extension configuration: ${err.message}`;
      }
    },
    initializeFormData(configData) {
      const data = { ...configData };

      if (this.schema?.properties) {
        Object.entries(this.schema.properties).forEach(
          ([propName, propSchema]) => {
            if (data[propName] === undefined) {
              data[propName] = getDefaultValue(propSchema);
            }
          },
        );
      }

      return data;
    },
    onFieldChange(propName, value) {
      this.$set(this.formData, propName, value);

      const prefix = `${propName}.`;
      Object.keys(this.validationErrors).forEach((key) => {
        if (key === propName || key.startsWith(prefix)) {
          this.$delete(this.validationErrors, key);
        }
      });
    },
    validateForm() {
      if (!this.schema) {
        return false;
      }
      if (!this.compiledValidator) {
        this.compiledValidator = this.ajv.compile(this.schema);
      }
      const validate = this.compiledValidator;
      const valid = validate(this.normalizedFormData);

      if (!valid) {
        const nextErrors = {};
        validate.errors?.forEach((error) => {
          const field = error.instancePath
            .replace(/^\//, '')
            .replace(/\//g, '.');
          const message = this.formatValidationError(error);

          if (error.params?.missingProperty) {
            const errorKey = field
              ? `${field}.${error.params.missingProperty}`
              : error.params.missingProperty;
            nextErrors[errorKey] = message;
          } else if (field) {
            nextErrors[field] = message;
          }
        });
        this.validationErrors = nextErrors;
        return false;
      }

      this.validationErrors = {};
      return true;
    },
    // Normalize form data by omitting fields that are null entirely.
    // Required for schema validation to correctly determine missing required fields.
    normalizeFormData(data) {
      if (data === null || data === undefined) {
        return data;
      }

      if (Array.isArray(data)) {
        return data.map((item) => this.normalizeFormData(item));
      }

      if (typeof data === 'object') {
        const normalized = {};
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (value !== null) {
            normalized[key] = this.normalizeFormData(value);
          }
        });
        return normalized;
      }

      return data;
    },
    formatValidationError(error) {
      const { keyword, params, message } = error;

      switch (keyword) {
        case 'required':
          return this.$t('validation.schema.required', {
            property: params.missingProperty,
          });
        case 'type':
          return this.$t('validation.schema.type', { type: params.type });
        case 'format':
          return this.$t('validation.schema.format', { format: params.format });
        case 'minLength':
          return this.$t('validation.schema.min_length', {
            limit: params.limit,
          });
        case 'maxLength':
          return this.$t('validation.schema.max_length', {
            limit: params.limit,
          });
        case 'minimum':
          return this.$t('validation.schema.minimum', { limit: params.limit });
        case 'maximum':
          return this.$t('validation.schema.maximum', { limit: params.limit });
        case 'minItems':
          return this.$t('validation.schema.min_items', {
            limit: params.limit,
          });
        case 'maxItems':
          return this.$t('validation.schema.max_items', {
            limit: params.limit,
          });
        case 'pattern':
          return this.$t('validation.schema.pattern');
        case 'enum':
          return this.$t('validation.schema.enum', {
            values: params.allowedValues?.join(', '),
          });
        case 'uniqueItems':
          return this.$t('validation.schema.unique_items');
        default:
          return message || this.$t('validation.schema.invalid');
      }
    },
    validationErrorSummary() {
      const errorCount = Object.keys(this.validationErrors).length;
      return errorCount === 1
        ? this.$t('validation.schema.validation_failed')
        : this.$t('validation.schema.validation_failed_plural', {
            count: errorCount,
          });
    },
    async toastValidationFailure() {
      await this.$toastr.e(
        this.validationErrorSummary(),
        this.$t('message.input_validation_failed'),
      );
    },
    async updateConfig() {
      if (this.isSavingInProgress) {
        return;
      }

      if (!this.validateForm()) {
        await this.toastValidationFailure();
        return;
      }

      try {
        this.isSavingInProgress = true;
        const response = await this.axios.put(
          `${this.$api.BASE_URL}/api/v2/extension-points/${this.extensionPointName}/extensions/${this.extensionName}/config`,
          {
            config: this.normalizedFormData,
          },
          {
            validateStatus: function (status) {
              return status === 204 || status === 304;
            },
          },
        );

        this.validationErrors = {};
        this.initialSnapshot = JSON.stringify(this.normalizedFormData);

        if (response.status === 204) {
          await this.$toastr.s(
            this.$t('message.record_updated_message'),
            this.$t('message.record_updated_title'),
          );
        } else if (response.status === 304) {
          await this.$toastr.i(
            this.$t('message.record_unchanged_message'),
            this.$t('message.record_unchanged_title'),
          );
        }
      } finally {
        this.isSavingInProgress = false;
      }
    },
    resetChanges() {
      if (!this.initialSnapshot) {
        return;
      }
      this.formData = JSON.parse(this.initialSnapshot);
      this.validationErrors = {};
    },
    async onSubmit(event) {
      event.preventDefault();
      await this.updateConfig();
    },
    getValidationError(propName) {
      return this.validationErrors[propName] || null;
    },
    // Used by external consumers (e.g. Alerts.vue) that embed this form in
    // their own save flow. Throws a descriptive Error on failure; the caller
    // is responsible for surfacing it (we do NOT toast here to avoid
    // duplicating the caller's own error handling).
    async validateAndGetConfig() {
      if (!this.validateForm()) {
        throw new Error(this.validationErrorSummary());
      }
      return this.normalizedFormData;
    },
    async testConfig() {
      if (this.isOperationInProgress) {
        return;
      }

      if (!this.validateForm()) {
        await this.toastValidationFailure();
        return;
      }

      try {
        this.isTestInProgress = true;
        this.testResults = null;

        const config = this.normalizedFormData;

        const response = await this.axios.post(
          `${this.$api.BASE_URL}/api/v2/extension-points/${this.extensionPointName}/extensions/${this.extensionName}/test`,
          { config },
        );

        this.testResults = response.data;
        this.$refs.testResultsModal.show();
      } finally {
        this.isTestInProgress = false;
      }
    },
    getCheckVariant(status) {
      switch (status) {
        case 'PASSED':
          return 'success';
        case 'FAILED':
          return 'danger';
        case 'SKIPPED':
          return 'warning';
        default:
          return 'secondary';
      }
    },
    getCheckIcon(status) {
      switch (status) {
        case 'PASSED':
          return 'fa fa-check-circle';
        case 'FAILED':
          return 'fa fa-times-circle';
        case 'SKIPPED':
          return 'fa fa-minus-circle';
        default:
          return 'fa fa-question-circle';
      }
    },
  },
};
</script>

<style scoped>
.extension-config-form__skeleton {
  padding: 0.5rem 0;
}
.skeleton-line {
  background: linear-gradient(
    90deg,
    rgba(128, 128, 128, 0.12) 0%,
    rgba(128, 128, 128, 0.22) 50%,
    rgba(128, 128, 128, 0.12) 100%
  );
  background-size: 200% 100%;
  border-radius: 3px;
  margin-bottom: 0.75rem;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}
.skeleton-line--label {
  height: 0.75rem;
  width: 30%;
}
.skeleton-line--field {
  height: 2rem;
  width: 100%;
  margin-bottom: 1.25rem;
}
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
