<template>
  <audit-panel
    :url="`${$api.BASE_URL}/${$api.URL_POLICY_VIOLATION_ANALYSIS}`"
    :ids="{
      policyViolation: violation.uuid,
      component: violation.component.uuid,
    }"
    :fields="{ analysisState: 'NOT_SET', isSuppressed: false }"
    :can-analyze="canAnalyze"
    :states="analysisChoices"
  >
    <p
      v-if="violation.text"
      class="audit-text fw-semibold mb-1"
      v-text="violation.text"
    />
    <div
      class="audit-facts audit-meta d-flex flex-wrap align-items-center mb-3"
    >
      <span
        :class="`label label-notification label-notification-${violationState.toLowerCase()}`"
        :title="$t('message.violation_state')"
        >{{ violationState }}</span
      >
      <span :title="$t('message.risk_type')">{{
        capitalize(violation.type)
      }}</span>
    </div>
    <details class="audit-details mb-3">
      <summary>{{ $t('message.condition') }}</summary>
      <code class="mt-2">{{ conditionString }}</code>
      <dl v-if="subjectValue?.value" class="mt-2 mb-0">
        <dt>{{ subjectValue.label }}</dt>
        <dd>
          <code>{{ subjectValue.value }}</code>
        </dd>
      </dl>
    </details>
  </audit-panel>
</template>

<script>
import common from '@/shared/common';
import permissionsMixin from '@/mixins/permissionsMixin';
import AuditPanel from '@/views/components/AuditPanel.vue';

export default {
  components: { AuditPanel },
  mixins: [permissionsMixin],
  props: {
    violation: Object,
  },
  data() {
    return {
      analysisChoices: [
        {
          value: 'NOT_SET',
          variant: 'secondary',
          text: this.$t('message.not_set'),
        },
        {
          value: 'APPROVED',
          variant: 'success',
          text: this.$t('message.approved'),
        },
        {
          value: 'REJECTED',
          variant: 'danger',
          text: this.$t('message.rejected'),
        },
      ],
    };
  },
  computed: {
    canAnalyze() {
      return this.isPermitted(this.PERMISSIONS.POLICY_VIOLATION_ANALYSIS);
    },
    violationState() {
      return this.violation.policyCondition.policy.violationState;
    },
    conditionString() {
      const condition = this.violation.policyCondition;
      return `${condition.subject} ${condition.operator} ${condition.value}`;
    },
    subjectValue() {
      const component = this.violation.component;
      switch (this.violation.policyCondition.subject) {
        case 'COORDINATES':
          return {
            label: this.$t('message.component'),
            value: common.concatenateComponentName(
              component.group,
              component.name,
              component.version,
            ),
          };
        case 'CPE':
          return { label: this.$t('message.cpe'), value: component.cpe };
        case 'PACKAGE_URL':
          return { label: this.$t('message.purl'), value: component.purl };
        case 'SWID_TAGID':
          return { label: this.$t('message.swid'), value: component.swid };
        case 'LICENSE':
        case 'LICENSE_GROUP':
          return {
            label: this.$t('message.license'),
            value: component.resolvedLicense?.licenseId,
          };
        default:
          return null;
      }
    },
  },
  methods: {
    capitalize: common.capitalize,
  },
};
</script>
