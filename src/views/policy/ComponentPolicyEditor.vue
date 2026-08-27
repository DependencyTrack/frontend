<template>
  <div
    class="animated fadeIn"
    v-permission:or="[
      PERMISSIONS.POLICY_MANAGEMENT,
      PERMISSIONS.POLICY_MANAGEMENT_CREATE,
      PERMISSIONS.POLICY_MANAGEMENT_READ,
      PERMISSIONS.POLICY_MANAGEMENT_UPDATE,
    ]"
  >
    <b-card>
      <template #header>
        <h5 class="mb-0">{{ pageTitle }}</h5>
      </template>

      <b-row>
        <b-col sm="6">
          <b-input-group-form-input
            id="policy-name"
            :label="$t('message.name')"
            input-group-size="mb-3"
            required="true"
            v-model="policy.name"
            lazy="true"
          />
          <b-form-group :label="$t('message.description')">
            <b-form-textarea
              id="policy-description"
              v-model="policy.description"
              rows="3"
            />
          </b-form-group>
          <b-form-group
            :label="$t('message.policy_operation_mode')"
            label-for="policy-operation-mode"
          >
            <b-form-select
              id="policy-operation-mode"
              v-model="policy.operationMode"
              :options="operationModeOptions"
            />
          </b-form-group>
        </b-col>
        <b-col sm="6">
          <b-form-group
            :label="$t('message.policy_priority')"
            label-for="policy-priority"
            class="mb-3"
          >
            <div class="d-flex align-items-center">
              <b-form-input
                id="policy-priority"
                type="range"
                v-model="policy.priority"
                min="0"
                max="100"
                step="1"
                class="flex-grow-1"
              />
              <span
                class="ml-2 font-weight-bold"
                style="min-width: 9em; text-align: right; white-space: nowrap"
                >{{ policy.priority }} - {{ priorityLabel }}</span
              >
            </div>
          </b-form-group>
          <b-input-group-form-datepicker
            id="policy-valid-from"
            :label="$t('message.validFrom')"
            input-group-size="mb-3"
            v-model="policy.validFrom"
          />
          <b-input-group-form-datepicker
            id="policy-valid-until"
            :label="$t('message.validUntil')"
            input-group-size="mb-3"
            v-model="policy.validUntil"
          />
        </b-col>
      </b-row>

      <hr />
      <h6>{{ $t('message.condition') }}</h6>
      <div class="mb-3">
        <b-dropdown variant="outline-primary" size="sm">
          <template #button-content>
            <i class="fa fa-magic"></i>
            {{ $t('message.policy_condition_templates') }}
          </template>
          <b-dropdown-item
            v-for="tpl in conditionTemplates"
            :key="tpl.label"
            @click="insertTemplate(tpl)"
          >
            {{ tpl.label }}
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <code-mirror-editor
        ref="conditionEditor"
        :value="policy.condition"
        @input="(value) => (policy.condition = value)"
        :completionSource="celCompletionSource"
      />

      <hr />
      <h6>License curation applied on match</h6>
      <b-row>
        <b-col sm="6">
          <b-form-group
            label="License override"
            label-for="policy-license"
            description="Applied to matching components on every BOM import"
          >
            <b-form-select
              id="policy-license"
              v-model="policy.license"
              :options="selectableLicenses"
            />
          </b-form-group>
        </b-col>
        <b-col sm="6">
          <b-form-group label="Details" label-for="policy-details">
            <b-form-textarea
              id="policy-details"
              v-model="policy.details"
              rows="2"
              placeholder="Written onto matched components (visible in their notes)"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <template #footer>
        <div class="d-flex">
          <b-button
            v-if="policyId"
            variant="outline-danger"
            @click="deletePolicy"
            >{{ $t('message.delete') }}</b-button
          >
          <div class="ml-auto">
            <b-button variant="secondary" class="mr-2" @click="goBack">{{
              $t('message.cancel')
            }}</b-button>
            <b-button variant="primary" @click="savePolicy">{{
              policyId ? $t('message.update') : $t('message.create')
            }}</b-button>
          </div>
        </div>
      </template>
    </b-card>
  </div>
</template>

<script>
import permissionsMixin from '../../mixins/permissionsMixin';
import BInputGroupFormInput from '../../forms/BInputGroupFormInput';
import BInputGroupFormDatepicker from '../../forms/BInputGroupFormDatepicker';
import CodeMirrorEditor from '@/views/components/CodeMirrorEditor.vue';
import { createCelCompletionSource } from './celCompletions';

export default {
  components: {
    BInputGroupFormInput,
    BInputGroupFormDatepicker,
    CodeMirrorEditor,
  },
  mixins: [permissionsMixin],
  props: {
    policyId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      celCompletionSource: createCelCompletionSource({
        vuln: undefined,
        vulns: undefined,
      }),
      selectableLicenses: [],
      operationModeOptions: [
        { value: 'APPLY', text: 'Apply' },
        { value: 'DISABLED', text: 'Disabled' },
      ],
      policy: {
        name: '',
        description: '',
        operationMode: 'APPLY',
        priority: '0',
        validFrom: null,
        validUntil: null,
        condition: '',
        license: '',
        details: '',
      },
      conditionTemplates: [
        {
          label: 'Component has no license at all',
          value:
            '!has(component.resolved_license) && component.license_name == "" && component.license_expression == ""',
        },
        {
          label: 'Component license could not be resolved',
          value: '!has(component.resolved_license)',
        },
        {
          label: 'Component declares a multi-license expression',
          value: 'component.license_expression != ""',
        },
        {
          label: 'Component has a specific resolved license',
          value: 'component.resolved_license.id == "GPL-3.0-only"',
        },
        {
          label: 'Components of one ecosystem (purl prefix)',
          value: 'component.purl.startsWith("pkg:pypi/")',
        },
        {
          label: 'One specific component without license (exact purl)',
          value:
            'component.purl == "pkg:pypi/example@1.0.0" && !has(component.resolved_license) && component.license_name == "" && component.license_expression == ""',
        },
        {
          label: 'One specific component (name and version)',
          value: 'component.name == "example" && component.version == "1.0.0"',
        },
        {
          label: 'Ecosystem within one project',
          value:
            'project.name == "my-repo" && component.purl.startsWith("pkg:npm/")',
        },
      ],
    };
  },
  computed: {
    pageTitle() {
      return this.policyId
        ? 'Edit Component Policy'
        : 'Create Component Policy';
    },
    priorityLabel() {
      const priority = Number(this.policy.priority);
      if (priority <= 25) return this.$t('message.policy_priority_high');
      if (priority <= 75) return this.$t('message.policy_priority_normal');
      return this.$t('message.policy_priority_low');
    },
  },
  created() {
    this.retrieveLicenses();
    if (this.policyId) {
      this.loadPolicy();
    }
  },
  methods: {
    insertTemplate(tpl) {
      const current = (this.policy.condition || '').trimEnd();
      const combined = current ? `${current}\n&& ${tpl.value}` : tpl.value;
      this.policy.condition = combined;
      if (this.$refs.conditionEditor?.setValue) {
        this.$refs.conditionEditor.setValue(combined);
      }
    },
    retrieveLicenses() {
      const url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_CONCISE}`;
      this.axios.get(url).then((response) => {
        const licenses = [{ value: '', text: '' }];
        for (const license of response.data) {
          licenses.push({
            value: license.licenseId || license.name,
            text: license.name,
          });
        }
        this.selectableLicenses = licenses;
      });
    },
    loadPolicy() {
      const url = `${this.$api.BASE_URL}/api/v2/component-policies`;
      this.axios.get(url).then((response) => {
        const policy = (response.data.policies || []).find(
          (candidate) => String(candidate.id) === String(this.policyId),
        );
        if (!policy) {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
          return;
        }
        this.policy = {
          name: policy.name,
          description: policy.description || '',
          operationMode: policy.enabled ? 'APPLY' : 'DISABLED',
          priority: String(policy.priority),
          validFrom: policy.valid_from ? policy.valid_from.slice(0, 10) : null,
          validUntil: policy.valid_until
            ? policy.valid_until.slice(0, 10)
            : null,
          condition: policy.condition,
          license: policy.license || '',
          details: policy.details || '',
        };
        if (this.$refs.conditionEditor?.setValue) {
          this.$refs.conditionEditor.setValue(policy.condition);
        }
      });
    },
    savePolicy() {
      const body = {
        name: this.policy.name,
        description: this.policy.description || null,
        enabled: this.policy.operationMode === 'APPLY',
        priority: Number(this.policy.priority) || 0,
        condition: this.policy.condition,
        license: this.policy.license || null,
        details: this.policy.details || null,
        valid_from: this.policy.validFrom
          ? `${this.policy.validFrom}T00:00:00Z`
          : null,
        valid_until: this.policy.validUntil
          ? `${this.policy.validUntil}T23:59:59Z`
          : null,
      };
      const base = `${this.$api.BASE_URL}/api/v2/component-policies`;
      const request = this.policyId
        ? this.axios.put(`${base}/${this.policyId}`, body)
        : this.axios.post(base, body);
      request
        .then(() => {
          this.$toastr.s(this.$t('message.updated'));
          this.goBack();
        })
        .catch((error) => {
          this.$toastr.w(
            error.response && error.response.status === 400
              ? 'Rejected: check the CEL condition and that the license exists'
              : this.$t('condition.unsuccessful_action'),
          );
        });
    },
    deletePolicy() {
      const url = `${this.$api.BASE_URL}/api/v2/component-policies/${this.policyId}`;
      this.axios.delete(url).then(() => {
        this.$toastr.s(this.$t('message.policy_deleted'));
        this.goBack();
      });
    },
    goBack() {
      this.$router.push('/policy/componentPolicies');
    },
  },
};
</script>
