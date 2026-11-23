<template>
  <div class="health-view">
    <div v-if="state === 'loading'" class="state">
      {{ $t('message.loading') }}…
    </div>
    <div v-else-if="state === 'empty'" class="state">
      {{ $t('message.health_no_metadata') }}
    </div>
    <div v-else-if="state === 'not_available'" class="state">
      {{ $t('message.health_not_available') }}
    </div>
    <div v-else-if="state === 'error'" class="state">
      {{ $t('message.health_load_failed') }}
    </div>
    <template v-else-if="metrics">
      <div class="heading">
        <h1>{{ $t('message.health_component_metrics') }}</h1>
        <span class="meta">{{
          $t('message.health_retrieved', { when: retrievedAt })
        }}</span>
        <details class="sources">
          <summary>{{ $t('message.health_sources_and_timestamps') }}</summary>
          <div class="sources-panel">
            <strong>{{ $t('message.health_data_provenance') }}</strong>
            <dl>
              <dt>{{ $t('message.health_sources') }}</dt>
              <dd>{{ sourceLabel }}</dd>
              <dt>{{ $t('message.health_retrieved_label') }}</dt>
              <dd>{{ retrievedAt }}</dd>
              <dt>{{ $t('message.health_project_metadata_as_of') }}</dt>
              <dd>{{ formatStamp(metrics.project_metadata_observed_at) }}</dd>
              <dt>{{ $t('message.health_scorecard_generated') }}</dt>
              <dd>{{ formatStamp(metrics.scorecard_timestamp) }}</dd>
              <dt>{{ $t('message.health_scorecard_engine') }}</dt>
              <dd>{{ metrics.scorecard_reference_version || missingLabel }}</dd>
            </dl>
          </div>
        </details>
      </div>
      <div class="summary">
        <div class="stat score-stat">
          <div
            class="score-ring"
            :style="ringColor ? { color: ringColor } : null"
            role="img"
            :aria-label="ringLabel"
          >
            <svg viewBox="0 0 60 60" aria-hidden="true">
              <circle class="ring-track" cx="30" cy="30" r="26"></circle>
              <circle
                v-if="ringScore"
                class="ring-score"
                cx="30"
                cy="30"
                r="26"
                pathLength="100"
                :stroke-dasharray="ringScore * 10 + ' 100'"
                transform="rotate(-90 30 30)"
              ></circle>
            </svg>
            <span class="ring-number" aria-hidden="true">
              <template v-if="ringScore != null">
                {{ formatScorecardScore(ringScore)
                }}<small>{{ $t('message.health_ring_scale') }}</small>
              </template>
              <template v-else>{{ missingLabel }}</template>
            </span>
          </div>
          <div class="score-caption">
            <span class="statlabel">{{
              $t('message.health_openssf_scorecard')
            }}</span>
            <span class="meta">{{
              $t('message.health_generated_on', {
                date: formatStamp(metrics.scorecard_timestamp, false),
              })
            }}</span>
          </div>
        </div>
        <div class="stat">
          <span class="statlabel">{{ $t('message.health_last_commit') }}</span>
          <strong class="repo-value">{{
            formatStamp(metrics.last_commit, false)
          }}</strong>
          <span class="meta">{{
            $t('message.health_repository_activity')
          }}</span>
        </div>
        <div class="stat">
          <span class="statlabel">{{ $t('message.health_repository') }}</span>
          <strong class="repo-value">{{ archivedLabel }}</strong>
          <span class="meta">{{
            $t('message.health_repository_metadata')
          }}</span>
        </div>
      </div>
      <div class="columns">
        <section class="panel">
          <div class="panelhead scorecard-head">
            <h2>{{ $t('message.health_scorecard_checks') }}</h2>
            <b-form-select
              v-model="checkSort"
              :options="checkSortOptions"
              size="sm"
              class="check-sort"
              :aria-label="$t('message.health_sort_checks')"
            />
          </div>
          <scorecard-checks
            :checks="metrics.scorecard_checks"
            :sort-mode="checkSort"
          />
        </section>
        <div class="rightstack">
          <section class="panel">
            <div class="panelhead">
              <h2>{{ $t('message.health_maintenance_community') }}</h2>
              <span class="meta source-links">
                <a
                  v-if="githubHref"
                  :href="githubHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ $t('message.health_source_github') }}</a
                >
                <template v-else>{{
                  $t('message.health_source_github')
                }}</template>
                <span aria-hidden="true"> · </span>
                <a
                  v-if="depsDevHref"
                  :href="depsDevHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ $t('message.health_source_deps_dev') }}</a
                >
                <template v-else>{{
                  $t('message.health_source_deps_dev')
                }}</template>
              </span>
            </div>
            <dl class="metrics">
              <dt>{{ $t('message.health_contributors') }}</dt>
              <dd>{{ formatNumber(metrics.contributors) }}</dd>
              <dt>{{ $t('message.health_weekly_commits') }}</dt>
              <dd>{{ formatNumber(metrics.commit_frequency_weekly, 1) }}</dd>
              <dt>{{ $t('message.health_open_issues') }}</dt>
              <dd>{{ formatNumber(metrics.open_issues) }}</dd>
              <dt>{{ $t('message.health_open_pull_requests') }}</dt>
              <dd>{{ formatNumber(metrics.open_prs) }}</dd>
              <dt>{{ $t('message.health_average_issue_age') }}</dt>
              <dd>{{ issueAgeLabel }}</dd>
              <dt>{{ $t('message.health_bus_factor') }}</dt>
              <dd>{{ formatNumber(metrics.bus_factor) }}</dd>
              <dt>{{ $t('message.health_files') }}</dt>
              <dd>{{ formatNumber(metrics.files) }}</dd>
            </dl>
            <div class="community">
              <div>
                <span>{{ $t('message.health_stars') }}</span>
                <strong>{{ formatNumber(metrics.stars) }}</strong>
              </div>
              <div>
                <span>{{ $t('message.health_forks') }}</span>
                <strong>{{ formatNumber(metrics.forks) }}</strong>
              </div>
              <div>
                <span>{{ $t('message.health_known_dependents') }}</span>
                <strong>{{ formatNumber(metrics.dependents) }}</strong>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="panelhead">
              <h2>{{ $t('message.health_repository_features') }}</h2>
              <span class="meta">{{ $t('message.health_source_github') }}</span>
            </div>
            <dl class="metrics">
              <template v-for="feature in features" :key="feature.label">
                <dt>{{ feature.label }}</dt>
                <dd :class="feature.value === true ? 'present' : 'absent'">
                  {{ featureLabel(feature.value) }}
                </dd>
              </template>
            </dl>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ScorecardChecks from './ScorecardChecks.vue';
import api from '@/shared/api.json';
import common from '@/shared/common';
import {
  HEALTH_SCORE_COLOR,
  healthScoreTone,
  parseHealthScore,
} from '@/shared/healthScoreTone';
import { formatScorecardScore } from '@/shared/scorecardColumn';

const GITHUB_FIELDS = [
  'github_url',
  'contributors',
  'commit_frequency_weekly',
  'open_issues',
  'open_prs',
  'last_commit',
  'bus_factor',
  'files',
  'is_repo_archived',
  'has_readme',
  'has_code_of_conduct',
  'has_security_policy',
];
const DEPS_DEV_FIELDS = [
  'deps_dev_url',
  'dependents',
  'stars',
  'forks',
  'project_metadata_observed_at',
];
const SCORECARD_FIELDS = [
  'scorecard_score',
  'scorecard_checks',
  'scorecard_timestamp',
  'scorecard_reference_version',
];

const props = defineProps({
  uuid: { type: String, required: true },
});
const emit = defineEmits(['score']);

const { t, locale } = useI18n();
const metrics = ref(null);
const state = ref('loading');
const checkSort = ref('score');

const missingLabel = computed(() => t('message.health_missing'));
const checkSortOptions = computed(() => [
  { value: 'score', text: t('message.health_lowest_scores_first') },
  { value: 'risk', text: t('message.health_highest_risk_first') },
]);
const retrievedAt = computed(() => formatStamp(metrics.value.last_fetch));
const archivedLabel = computed(() => {
  const archived = metrics.value.is_repo_archived;
  if (archived == null) {
    return missingLabel.value;
  }
  return archived
    ? t('message.health_archived')
    : t('message.health_not_archived');
});
const issueAgeLabel = computed(() => {
  const formatted = formatNumber(metrics.value.avg_issue_age_days, 1);
  return formatted === missingLabel.value
    ? formatted
    : t('message.health_days_value', { value: formatted });
});
const features = computed(() => [
  { label: t('message.health_readme'), value: metrics.value.has_readme },
  {
    label: t('message.health_code_of_conduct'),
    value: metrics.value.has_code_of_conduct,
  },
  {
    label: t('message.health_security_policy'),
    value: metrics.value.has_security_policy,
  },
]);
const githubHref = computed(() => externalHref(metrics.value.github_url));
const depsDevHref = computed(() => externalHref(metrics.value.deps_dev_url));
const sourceLabel = computed(() => {
  const names = [];
  if (hasAny(GITHUB_FIELDS)) {
    names.push(t('message.health_source_github'));
  }
  if (hasAny(DEPS_DEV_FIELDS)) {
    names.push(t('message.health_source_deps_dev'));
  }
  if (hasAny(SCORECARD_FIELDS)) {
    names.push(t('message.health_openssf_scorecard'));
  }
  return names.length ? names.join(' · ') : missingLabel.value;
});
const ringScore = computed(() =>
  parseHealthScore(metrics.value.scorecard_score),
);
const ringColor = computed(
  () => HEALTH_SCORE_COLOR[healthScoreTone(ringScore.value)],
);
const ringLabel = computed(() =>
  ringScore.value == null
    ? t('message.health_scorecard_aria_unavailable')
    : t('message.health_scorecard_aria', {
        score: formatScorecardScore(ringScore.value),
      }),
);

function hasAny(fields) {
  return fields.some((field) => {
    const value = metrics.value[field];
    return Array.isArray(value)
      ? value.length > 0
      : value != null && value !== '';
  });
}

function externalHref(url) {
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

function formatNumber(value, digits) {
  const numeric = value == null || value === '' ? NaN : Number(value);
  if (!Number.isFinite(numeric)) {
    return missingLabel.value;
  }
  const options =
    digits == null
      ? undefined
      : { minimumFractionDigits: digits, maximumFractionDigits: digits };
  return new Intl.NumberFormat(locale.value, options).format(numeric);
}

function featureLabel(value) {
  if (value == null) {
    return t('message.health_unknown');
  }
  return value ? t('message.health_present') : t('message.health_not_present');
}

function formatStamp(value, includeTime = true) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return missingLabel.value;
  }
  return common.formatTimestamp(value, includeTime);
}

async function fetchMetrics() {
  try {
    // A component without stored health is expected, so 404 must not raise the global error toast.
    const response = await axios.get(
      `${api.BASE_URL}/api/v2/components/${props.uuid}/health`,
      { validateStatus: (status) => status === 200 || status === 404 },
    );
    if (response.status === 404) {
      state.value = 'empty';
    } else if (response.data.status === 'NOT_AVAILABLE') {
      state.value = 'not_available';
    } else {
      metrics.value = response.data;
      state.value = 'ready';
      emit('score', parseHealthScore(response.data.scorecard_score));
      return;
    }
  } catch {
    state.value = 'error';
  }
  emit('score', null);
}

onMounted(fetchMetrics);
</script>

<style scoped>
.health-view {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  color: var(--dt-text);
  font-size: 12px;
  line-height: 16px;
}

.health-view * {
  box-sizing: border-box;
}

.state {
  padding: 16px 0;
  color: var(--dt-text-muted);
  text-align: center;
}

.heading {
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  gap: 8px;
}

h1 {
  margin: 0;
  color: var(--dt-text-heading);
  font-size: 14px;
  line-height: 18px;
  font-weight: 600;
}

.meta {
  font-size: 11px;
  color: var(--dt-text-muted);
}

.source-links a {
  color: var(--dt-accent);
}

.sources {
  position: relative;
  font-size: 11px;
}

summary {
  color: var(--dt-accent);
  cursor: pointer;
}

.sources-panel {
  position: absolute;
  right: 0;
  top: 23px;
  width: 310px;
  padding: 12px;
  background: var(--dt-surface-raised);
  border: 1px solid var(--dt-border-control);
  border-radius: 3px;
  z-index: 3;
  font-size: 12px;
  line-height: 19px;
  overflow-wrap: anywhere;
}

.sources-panel strong {
  color: var(--dt-text-heading);
}

.sources-panel dl {
  margin: 8px 0 0;
  display: block;
  padding: 0;
}

.sources-panel dt {
  color: var(--dt-text-muted);
  margin-top: 6px;
}

.sources-panel dd {
  margin: 0;
  text-align: left;
}

.summary,
.panel {
  background: var(--dt-surface-card);
  border: 1px solid var(--dt-border);
  border-radius: 3px;
}

/* Matches the light theme's cards, which trade the faint border for a line and a shadow. */
[data-bs-theme='light'] .summary,
[data-bs-theme='light'] .panel {
  border-color: var(--dt-line);
  box-shadow: 0 1px 2px rgba(28, 34, 48, 0.08);
}

.summary {
  height: 64px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.stat {
  padding: 6px 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 8px;
  align-items: center;
  min-width: 0;
}

.stat + .stat {
  border-left: 1px solid var(--dt-border);
}

.statlabel {
  color: var(--dt-text-heading);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
}

.stat .meta {
  grid-column: 1 / -1;
}

.repo-value {
  font-size: 16px;
  color: var(--dt-text-heading);
  white-space: nowrap;
}

.columns {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: 10px;
  margin-top: 10px;
  align-items: start;
}

.panel {
  min-width: 0;
}

.panelhead {
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  gap: 8px;
  background: transparent;
  border-bottom: 1px solid var(--dt-border);
}

.check-sort {
  width: 160px;
  height: 24px;
  flex: 0 0 auto;
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 11px;
  line-height: 22px;
}

h2 {
  margin: 0;
  color: var(--dt-text-heading);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
}

.rightstack {
  display: grid;
  gap: 10px;
}

.metrics {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0 10px;
  padding: 3px 10px;
  margin: 0;
  line-height: 18px;
  font-size: 12px;
}

dt {
  font-weight: 400;
  min-width: 0;
}

dd {
  margin: 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 400;
}

.community {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-top: 1px solid var(--dt-border);
  padding: 4px 10px;
  gap: 8px;
}

.community span {
  display: block;
  color: var(--dt-text-muted);
  font-size: 11px;
  line-height: 14px;
  font-weight: 400;
}

.community strong {
  color: var(--dt-text-heading);
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
}

.present {
  color: var(--dt-severity-low-text);
  font-size: 11px;
}

.absent {
  color: var(--dt-text-muted);
  font-size: 11px;
}

.stat.score-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 12px;
}

.score-ring {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  position: relative;
  color: var(--dt-text);
}

.score-ring svg {
  display: block;
  width: 100%;
  height: 100%;
}

.ring-track {
  fill: none;
  stroke: var(--dt-line);
  stroke-width: 3.5;
}

.ring-score {
  fill: none;
  stroke: currentColor;
  stroke-width: 3.5;
  stroke-linecap: round;
}

.ring-number {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 17px;
  font-weight: 600;
  line-height: 19px;
  font-variant-numeric: tabular-nums;
  color: var(--dt-text-heading);
}

.ring-number small {
  font-size: 11px;
  font-weight: 400;
  line-height: 13px;
  color: var(--dt-text-muted);
}

.score-caption {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

@media (min-width: 1400px) {
  .health-view {
    padding: 20px;
    font-size: 15px;
    line-height: 22px;
  }

  .heading {
    height: 48px;
  }

  h1 {
    font-size: 20px;
  }

  .summary {
    height: 92px;
  }

  .stat {
    padding: 12px 18px;
  }

  .statlabel {
    font-size: 15px;
    line-height: 22px;
  }

  .meta,
  .sources {
    font-size: 13px;
  }

  .columns {
    gap: 20px;
    margin-top: 20px;
  }

  .panelhead {
    height: 42px;
    padding: 0 16px;
  }

  .check-sort {
    width: 180px;
    height: 30px;
    font-size: 13px;
    line-height: 28px;
  }

  h2 {
    font-size: 15px;
  }

  .metrics {
    font-size: 14px;
    line-height: 26px;
    padding: 8px 16px;
  }

  .rightstack {
    gap: 20px;
  }

  .community {
    padding: 12px 16px;
  }

  .community span,
  .present,
  .absent {
    font-size: 13px;
  }

  .community strong {
    font-size: 17px;
    line-height: 25px;
  }

  .repo-value {
    font-size: 24px;
  }

  .stat.score-stat {
    padding: 7px 18px;
    gap: 18px;
  }

  .score-ring {
    width: 76px;
    height: 76px;
    flex-basis: 76px;
  }

  .ring-number {
    font-size: 24px;
    line-height: 27px;
  }

  .ring-number small {
    font-size: 13px;
    line-height: 16px;
  }
}

@media (max-width: 959px) {
  .columns {
    grid-template-columns: 1.3fr 1fr;
  }

  .summary {
    height: auto;
    min-height: 70px;
  }

  .stat {
    grid-template-columns: 1fr;
  }

  .repo-value {
    font-size: 16px;
  }

  .heading {
    height: auto;
    min-height: 38px;
    flex-wrap: wrap;
    padding: 6px 0;
  }

  .sources-panel {
    max-width: calc(100vw - 26px);
  }

  .meta {
    white-space: normal;
  }
}

@media (min-width: 651px) and (max-width: 959px) {
  .stat.score-stat {
    gap: 9px;
    padding: 5px 10px;
  }

  .score-caption .statlabel {
    font-size: 11px;
  }

  .score-caption .meta {
    line-height: 14px;
  }
}

@media (max-width: 650px) {
  .health-view {
    padding: 10px;
  }

  .scorecard-head {
    height: auto;
    min-height: 30px;
    flex-wrap: wrap;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .columns {
    grid-template-columns: 1fr;
  }

  .summary {
    grid-template-columns: 1fr;
  }

  .stat {
    grid-template-columns: 1fr auto;
    padding: 9px 12px;
  }

  .stat + .stat {
    border-left: 0;
    border-top: 1px solid var(--dt-border);
  }

  .stat.score-stat {
    padding: 10px 12px;
    gap: 14px;
  }

  .score-ring {
    width: 60px;
    height: 60px;
    flex-basis: 60px;
  }

  .sources {
    margin-left: auto;
  }

  .sources-panel {
    left: auto;
    right: 0;
  }

  .heading > .meta {
    display: none;
  }
}

@media (pointer: coarse) {
  summary {
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .heading {
    height: auto;
    min-height: 44px;
  }
}
</style>
