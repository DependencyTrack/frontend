<template>
  <div v-if="hasAnnotations">
    <span
      v-for="(annotation, index) in annotations"
      :key="annotationKey(annotation, index)"
      class="d-inline-block mr-1 mb-1"
    >
      <b-badge
        :variant="variant"
        v-b-tooltip.hover
        :title="tooltipFor(annotation)"
      >
        {{ displayText(annotation) }}
      </b-badge>
    </span>
  </div>
</template>

<script>
import common from '@/shared/common';

export default {
  props: {
    annotations: {
      type: Array,
      default: () => [],
    },
    /** When true, show only the policy name (table-style). */
    valuesOnly: {
      type: Boolean,
      default: false,
    },
    variant: {
      type: String,
      default: 'info',
    },
  },
  computed: {
    hasAnnotations() {
      return Array.isArray(this.annotations) && this.annotations.length > 0;
    },
  },
  methods: {
    displayText(annotation) {
      return annotation.policyName ?? annotation.value ?? '';
    },
    annotationKey(annotation, index) {
      return [annotation.policyName, annotation.appliedAt, index]
        .filter((part) => part != null && part !== '')
        .join('-');
    },
    tooltipFor(annotation) {
      const parts = [];
      const appliedAtLabel = common.formatPolicyAnnotationAppliedAt(
        annotation.appliedAt,
      );
      if (appliedAtLabel) {
        parts.push(
          this.$t('message.policy_annotation_applied_at', {
            timestamp: appliedAtLabel,
          }),
        );
      }
      if (annotation.annotator) {
        parts.push(
          this.$t('message.policy_annotation_annotator', {
            annotator: annotation.annotator,
          }),
        );
      }
      return parts.length > 0 ? parts.join('\n') : null;
    },
  },
};
</script>
