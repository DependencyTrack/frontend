<template>
  <audit-panel
    :url="`${$api.BASE_URL}/${$api.URL_ANALYSIS}`"
    :ids="{
      project: projectUuid,
      component: finding.component.uuid,
      vulnerability: vulnerability.uuid,
    }"
    :fields="{
      analysisState: 'NOT_SET',
      analysisJustification: 'NOT_SET',
      analysisResponse: 'NOT_SET',
      analysisDetails: '',
      isSuppressed: false,
    }"
    :can-analyze="canAnalyze"
    :no-analysis-status="404"
    :states="analysisChoices"
    :state-description="$t('message.analysis_tooltip')"
    @loaded="owaspVector = $event.owaspVector ?? null"
    @state-change="onStateChange"
  >
    <p v-if="vulnerability.title" class="fw-semibold mb-1">
      {{ vulnerability.title }}
    </p>
    <p v-if="vulnerability.subtitle" class="audit-meta mb-1">
      {{ vulnerability.subtitle }}
    </p>
    <div
      class="audit-facts audit-meta d-flex flex-wrap align-items-center mb-3"
    >
      <span
        v-if="vulnerability.severity"
        :class="`badge severity-${vulnerability.severity.toLowerCase()}-bg`"
        >{{ $t(`severity.${vulnerability.severity.toLowerCase()}`) }}</span
      >
      <span v-if="primaryScore"
        >{{ primaryScore.label }} {{ primaryScore.score }}</span
      >
      <span v-if="epss">{{ $t('message.epss') }} {{ epss }}</span>
      <kev-cell
        v-if="vulnerability.isKev"
        :source="vulnerability.source"
        :vuln-id="vulnerability.vulnId"
        :label="$t('message.kev')"
      />
    </div>
    <dl v-if="aliases.length > 0" class="audit-details">
      <dt>{{ $t('message.aliases') }}</dt>
      <dd class="d-flex flex-wrap column-gap-3">
        <b-link
          v-for="alias in aliases"
          :key="alias.vulnId"
          :href="'/vulnerabilities/' + alias.source + '/' + alias.vulnId"
          >{{ alias.vulnId }}</b-link
        >
      </dd>
    </dl>
    <details v-if="scores.length > 0" class="audit-details mb-3">
      <summary>{{ $t('message.ratings') }}</summary>
      <dl class="audit-ratings mt-2 mb-0">
        <template v-for="score in scores" :key="score.label">
          <dt>{{ score.label }}</dt>
          <dd>{{ score.score }}</dd>
          <dd class="text-truncate">
            <code v-if="score.vector" :title="score.vector">{{
              score.vector
            }}</code>
          </dd>
          <dd>
            <copy-to-clipboard-button
              v-if="score.vector"
              :value="score.vector"
              :label="score.label"
              size="sm"
            />
          </dd>
        </template>
      </dl>
    </details>
    <dl class="audit-details mb-0">
      <template v-if="vulnerability.description">
        <dt>{{ $t('message.description') }}</dt>
        <dd>
          <p
            id="findingDescription"
            class="audit-text mb-1"
            :class="{ 'audit-clamp': longDescription && !expanded }"
            v-text="vulnerability.description"
          />
          <b-button
            v-if="longDescription"
            variant="link"
            class="p-0"
            aria-controls="findingDescription"
            :aria-expanded="String(expanded)"
            @click="expanded = !expanded"
            >{{
              expanded ? $t('message.show_less') : $t('message.show_more')
            }}</b-button
          >
        </dd>
      </template>
      <template v-if="vulnerability.recommendation">
        <dt>{{ $t('message.recommendation') }}</dt>
        <dd class="audit-text" v-text="vulnerability.recommendation" />
      </template>
    </dl>
    <template #fields="{ form }">
      <b-form-group
        v-if="form.analysisState === 'NOT_AFFECTED'"
        :label="$t('message.justification')"
        :description="$t('message.justification_tooltip')"
        label-for="findingJustification"
      >
        <b-form-select
          id="findingJustification"
          v-model="form.analysisJustification"
          :options="justificationChoices"
        />
      </b-form-group>
      <b-form-group
        :label="$t('message.response')"
        :description="$t('message.response_tooltip')"
        label-for="findingResponse"
      >
        <b-form-select
          id="findingResponse"
          v-model="form.analysisResponse"
          :options="responseChoices"
        />
      </b-form-group>
      <b-form-group
        :label="$t('message.details')"
        :description="$t('message.analysis_details_tooltip')"
        label-for="findingDetails"
      >
        <b-form-textarea
          id="findingDetails"
          v-model="form.analysisDetails"
          rows="4"
        />
      </b-form-group>
    </template>
  </audit-panel>
</template>

<script>
import common from '@/shared/common';
import permissionsMixin from '@/mixins/permissionsMixin';
import AuditPanel from '@/views/components/AuditPanel.vue';
import CopyToClipboardButton from '@/views/components/CopyToClipboardButton.vue';
import KevCell from '@/views/components/KevCell.vue';

export default {
  components: { AuditPanel, CopyToClipboardButton, KevCell },
  mixins: [permissionsMixin],
  props: {
    finding: Object,
    projectUuid: String,
  },
  data() {
    return {
      owaspVector: null,
      expanded: false,
      analysisChoices: [
        {
          value: 'NOT_SET',
          variant: 'secondary',
          text: this.$t('message.not_set'),
        },
        {
          value: 'IN_TRIAGE',
          variant: 'info',
          text: this.$t('message.in_triage'),
        },
        {
          value: 'EXPLOITABLE',
          variant: 'danger',
          text: this.$t('message.exploitable'),
        },
        {
          value: 'RESOLVED',
          variant: 'success',
          text: this.$t('message.resolved'),
        },
        {
          value: 'FALSE_POSITIVE',
          variant: 'success',
          text: this.$t('message.false_positive'),
        },
        {
          value: 'NOT_AFFECTED',
          variant: 'success',
          text: this.$t('message.not_affected'),
        },
      ],
      justificationChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        {
          value: 'CODE_NOT_PRESENT',
          text: this.$t('message.code_not_present'),
        },
        {
          value: 'CODE_NOT_REACHABLE',
          text: this.$t('message.code_not_reachable'),
        },
        {
          value: 'REQUIRES_CONFIGURATION',
          text: this.$t('message.requires_configuration'),
        },
        {
          value: 'REQUIRES_DEPENDENCY',
          text: this.$t('message.requires_dependency'),
        },
        {
          value: 'REQUIRES_ENVIRONMENT',
          text: this.$t('message.requires_environment'),
        },
        {
          value: 'PROTECTED_BY_COMPILER',
          text: this.$t('message.protected_by_compiler'),
        },
        {
          value: 'PROTECTED_AT_RUNTIME',
          text: this.$t('message.protected_at_runtime'),
        },
        {
          value: 'PROTECTED_AT_PERIMETER',
          text: this.$t('message.protected_at_perimeter'),
        },
        {
          value: 'PROTECTED_BY_MITIGATING_CONTROL',
          text: this.$t('message.protected_by_mitigating_control'),
        },
      ],
      responseChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        { value: 'CAN_NOT_FIX', text: this.$t('message.can_not_fix') },
        { value: 'WILL_NOT_FIX', text: this.$t('message.will_not_fix') },
        { value: 'UPDATE', text: this.$t('message.update') },
        { value: 'ROLLBACK', text: this.$t('message.rollback') },
        {
          value: 'WORKAROUND_AVAILABLE',
          text: this.$t('message.workaround_available'),
        },
      ],
    };
  },
  computed: {
    canAnalyze() {
      return this.isPermitted([
        this.PERMISSIONS.VULNERABILITY_ANALYSIS,
        this.PERMISSIONS.VULNERABILITY_ANALYSIS_UPDATE,
      ]);
    },
    vulnerability() {
      return this.finding.vulnerability;
    },
    scores() {
      const v = this.vulnerability;
      const cvss = (score, vector, version) => ({
        label: `CVSS v${vector?.match(/^CVSS:([\d.]+)/)?.[1] ?? version}`,
        score: score?.toFixed(1),
        vector,
      });
      return [
        cvss(v.cvssV4Score, v.cvssV4Vector, '4.0'),
        cvss(v.cvssV3BaseScore, v.cvssV3Vector, '3'),
        cvss(v.cvssV2BaseScore, v.cvssV2Vector, '2.0'),
        { label: this.$t('message.owasp_rr_vector'), vector: this.owaspVector },
      ].filter((score) => score.score != null || score.vector);
    },
    primaryScore() {
      return this.scores.find((score) => score.score != null);
    },
    epss() {
      const { epssScore, epssPercentile } = this.vulnerability;
      if (epssScore == null) {
        return null;
      }
      const score = epssScore.toLocaleString(this.$i18n.locale, {
        style: 'percent',
        maximumFractionDigits: 2,
      });
      if (epssPercentile == null) {
        return score;
      }
      // Ordinal suffixes are English-only, so a translation of epss_score_percentile still gets "90th".
      const suffixes = { one: 'st', two: 'nd', few: 'rd', other: 'th' };
      // 0.29 * 100 is 28.999...
      const percentile = Math.floor(epssPercentile * 100 + 1e-9);
      const ordinal = new Intl.PluralRules('en', { type: 'ordinal' }).select(
        percentile,
      );
      return this.$t('message.epss_score_percentile', {
        score,
        percentile: percentile + suffixes[ordinal],
      });
    },
    longDescription() {
      return this.vulnerability.description?.length > 300;
    },
    aliases() {
      return common.resolveVulnAliases(
        this.vulnerability.source,
        this.vulnerability.aliases || [],
      );
    },
  },
  methods: {
    onStateChange(form, state, loaded) {
      if (state === loaded.analysisState) {
        form.analysisJustification = loaded.analysisJustification;
      } else if (state !== 'NOT_AFFECTED') {
        form.analysisJustification = 'NOT_SET';
      }
    },
  },
};
</script>
