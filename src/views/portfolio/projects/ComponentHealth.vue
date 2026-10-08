<template>
  <div class="health-view">
    <div v-if="state === 'loading'" class="state">
      {{ $t('message.loading') }}…
    </div>
    <div v-else-if="state === 'empty'" class="state">
      {{ $t('message.health_no_metadata') }}
    </div>
    <div v-else-if="state === 'in_progress'" class="state">
      {{ $t('message.health_in_progress') }}
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
              <dd>{{ metadataAsOf }}</dd>
              <dt>{{ $t('message.health_scorecard_generated') }}</dt>
              <dd>{{ scorecardGenerated }}</dd>
              <dt>{{ $t('message.health_scorecard_engine') }}</dt>
              <dd>{{ orMissing(metrics.scorecard_reference_version) }}</dd>
            </dl>
          </div>
        </details>
      </div>
      <div class="summary">
        <div class="stat score-stat">
          <div
            class="score-ring"
            :class="ringTone"
            :style="ringColor ? { color: ringColor } : null"
            role="img"
            :aria-label="ringLabel"
          >
            <svg viewBox="0 0 60 60" aria-hidden="true">
              <circle class="ring-track" cx="30" cy="30" r="26"></circle>
              <circle
                v-if="ringPercent > 0"
                class="ring-score"
                cx="30"
                cy="30"
                r="26"
                pathLength="100"
                :stroke-dasharray="ringDash"
                transform="rotate(-90 30 30)"
              ></circle>
            </svg>
            <span class="ring-number" aria-hidden="true">
              <template v-if="ringAvailable">
                {{ ringDisplay
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
              $t('message.health_generated_on', { date: generatedDate })
            }}</span>
          </div>
        </div>
        <div class="stat">
          <span class="statlabel">{{ $t('message.health_last_commit') }}</span>
          <strong class="repo-value">{{ lastCommitValue }}</strong>
          <span class="meta">{{ lastCommitMeta }}</span>
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
              <dt>{{ $t('message.health_readme') }}</dt>
              <dd :class="featureClass(metrics.has_readme)">
                {{ featureLabel(metrics.has_readme) }}
              </dd>
              <dt>{{ $t('message.health_code_of_conduct') }}</dt>
              <dd :class="featureClass(metrics.has_code_of_conduct)">
                {{ featureLabel(metrics.has_code_of_conduct) }}
              </dd>
              <dt>{{ $t('message.health_security_policy') }}</dt>
              <dd :class="featureClass(metrics.has_security_policy)">
                {{ featureLabel(metrics.has_security_policy) }}
              </dd>
            </dl>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import ScorecardChecks from './ScorecardChecks.vue';
import {
  HEALTH_SCORE_COLOR,
  healthScoreTone,
  parseHealthScore,
} from '../../../shared/healthScoreTone';
import { formatScorecardScore } from '../../../shared/scorecardColumn';
import common from '../../../shared/common';

export default {
  name: 'ComponentHealth',
  components: {
    ScorecardChecks,
  },
  props: {
    uuid: String,
  },
  data() {
    return {
      metrics: null,
      state: 'loading',
      checkSort: 'score',
    };
  },
  computed: {
    missingLabel() {
      return this.$t('message.health_missing');
    },
    checkSortOptions() {
      return [
        { value: 'score', text: this.$t('message.health_lowest_scores_first') },
        { value: 'risk', text: this.$t('message.health_highest_risk_first') },
      ];
    },
    retrievedAt() {
      return this.formatStamp(this.metrics && this.metrics.last_fetch, true);
    },
    metadataAsOf() {
      return this.formatStamp(
        this.metrics && this.metrics.project_metadata_observed_at,
        true,
      );
    },
    scorecardGenerated() {
      return this.formatStamp(
        this.metrics && this.metrics.scorecard_timestamp,
        true,
      );
    },
    generatedDate() {
      return this.formatStamp(
        this.metrics && this.metrics.scorecard_timestamp,
        false,
      );
    },
    lastCommitValue() {
      return this.formatStamp(this.metrics && this.metrics.last_commit, false);
    },
    lastCommitMeta() {
      return this.$t('message.health_repository_activity');
    },
    archivedLabel() {
      const value = this.metrics && this.metrics.is_repo_archived;
      if (value === true) {
        return this.$t('message.health_archived');
      }
      if (value === false) {
        return this.$t('message.health_not_archived');
      }
      return this.missingLabel;
    },
    issueAgeLabel() {
      const formatted = this.formatNumber(
        this.metrics && this.metrics.avg_issue_age_days,
        1,
      );
      if (formatted === this.missingLabel) {
        return formatted;
      }
      return this.$t('message.health_days_value', { value: formatted });
    },
    githubHref() {
      return this.externalHref(this.metrics && this.metrics.github_url);
    },
    depsDevHref() {
      return this.externalHref(this.metrics && this.metrics.deps_dev_url);
    },
    sourceLabel() {
      const names = [];
      if (this.hasGithub) {
        names.push(this.$t('message.health_source_github'));
      }
      if (this.hasDepsDev) {
        names.push(this.$t('message.health_source_deps_dev'));
      }
      if (this.hasScorecard) {
        names.push(this.$t('message.health_openssf_scorecard'));
      }
      return names.length ? names.join(' · ') : this.missingLabel;
    },
    hasGithub() {
      return this.hasAny([
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
      ]);
    },
    hasDepsDev() {
      return this.hasAny([
        'deps_dev_url',
        'dependents',
        'stars',
        'forks',
        'project_metadata_observed_at',
      ]);
    },
    hasScorecard() {
      return this.hasAny([
        'scorecard_score',
        'scorecard_checks',
        'scorecard_timestamp',
        'scorecard_reference_version',
      ]);
    },
    ringScore() {
      return parseHealthScore(this.metrics && this.metrics.scorecard_score);
    },
    ringAvailable() {
      return this.ringScore != null;
    },
    ringDisplay() {
      return this.ringAvailable ? formatScorecardScore(this.ringScore) : '';
    },
    ringPercent() {
      if (!this.ringAvailable) {
        return 0;
      }
      return (this.ringScore / 10) * 100;
    },
    ringTone() {
      const tone = healthScoreTone(this.ringScore);
      return tone ? 'is-' + tone : 'is-unavailable';
    },
    ringColor() {
      const tone = healthScoreTone(this.ringScore);
      return tone ? HEALTH_SCORE_COLOR[tone] : null;
    },
    ringDash() {
      return this.ringPercent + ' 100';
    },
    ringLabel() {
      if (!this.ringAvailable) {
        return this.$t('message.health_scorecard_aria_unavailable');
      }
      return this.$t('message.health_scorecard_aria', {
        score: this.ringDisplay,
      });
    },
  },
  methods: {
    hasAny(fields) {
      return fields.some((field) => {
        const value = this.metrics && this.metrics[field];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value != null && value !== '';
      });
    },
    externalHref(url) {
      if (typeof url !== 'string' || url === '') {
        return null;
      }
      try {
        const parsed = new URL(url);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          return parsed.href;
        }
      } catch {
        return null;
      }
      return null;
    },
    isBlank(value) {
      return value === null || value === undefined || value === '';
    },
    orMissing(value) {
      return this.isBlank(value) ? this.missingLabel : value;
    },
    formatNumber(value, digits) {
      if (this.isBlank(value)) {
        return this.missingLabel;
      }
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        return this.missingLabel;
      }
      const fractionDigits =
        digits == null
          ? undefined
          : { minimumFractionDigits: digits, maximumFractionDigits: digits };
      return new Intl.NumberFormat(this.$i18n.locale, fractionDigits).format(
        numeric,
      );
    },
    featureLabel(value) {
      if (value === true) {
        return this.$t('message.health_present');
      }
      if (value === false) {
        return this.$t('message.health_not_present');
      }
      return this.$t('message.health_unknown');
    },
    featureClass(value) {
      return {
        present: value === true,
        absent: value !== true,
      };
    },
    formatStamp(value, includeTime) {
      if (this.isBlank(value) || Number.isNaN(new Date(value).getTime())) {
        return this.missingLabel;
      }
      return common.formatTimestamp(value, includeTime);
    },
    badgeScore(data) {
      if (
        !data ||
        data.status !== 'PROCESSED' ||
        data.scorecard_score == null
      ) {
        return null;
      }
      return data.scorecard_score;
    },
    publishScore(data) {
      this.$emit('score', this.badgeScore(data));
    },
    fetchMetrics() {
      const url = `${this.$api.BASE_URL}/api/v2/components/${this.uuid}/health`;
      this.axios
        .get(url)
        .then((response) => {
          const data = response.data || {};
          if (data.status === 'IN_PROGRESS') {
            this.state = 'in_progress';
            this.publishScore(null);
            return;
          }
          if (data.status === 'NOT_AVAILABLE') {
            this.state = 'not_available';
            this.publishScore(null);
            return;
          }
          this.metrics = data;
          this.state = 'ready';
          this.publishScore(data);
        })
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            this.state = 'empty';
          } else {
            this.state = 'error';
          }
          this.publishScore(null);
        });
    },
  },
  mounted() {
    this.fetchMetrics();
  },
};
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/variables';

.health-view {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  color: $body-color;
  font-size: 12px;
  line-height: 16px;
}

.health-view * {
  box-sizing: border-box;
}

.state {
  padding: 16px 0;
  color: $grey-600;
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
  font-size: 14px;
  line-height: 18px;
  font-weight: 600;
}

.meta {
  font-size: 11px;
  color: $grey-600;
}

.source-links a {
  color: var(--primary);
  text-decoration: none;
}

.source-links a:hover,
.source-links a:focus-visible {
  color: var(--primary-lighter);
  text-decoration: underline;
}

.sources {
  position: relative;
  font-size: 11px;
}

summary {
  color: var(--primary);
  cursor: pointer;
}

summary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.sources-panel {
  position: absolute;
  right: 0;
  top: 23px;
  width: 310px;
  padding: 12px;
  background: $dropdown-bg;
  border: 1px solid $dropdown-border-color;
  border-radius: 3px;
  z-index: 3;
  font-size: 12px;
  line-height: 19px;
  overflow-wrap: anywhere;
}

.sources-panel dl {
  margin: 8px 0 0;
  display: block;
  padding: 0;
}

.sources-panel dt {
  color: $grey-600;
  margin-top: 6px;
}

.sources-panel dd {
  margin: 0;
  text-align: left;
}

.summary {
  height: 64px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: $card-bg;
  border: 1px solid $border-color;
  border-radius: 3px;
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
  border-left: 1px solid $border-color;
}

.statlabel {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
}

.stat .meta {
  grid-column: 1 / -1;
}

.repo-value {
  font-size: 16px;
  color: $body-color;
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
  background: $card-bg;
  border: 1px solid $border-color;
  border-radius: 3px;
}

.panelhead {
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  gap: 8px;
  background: $card-cap-bg;
  border-bottom: 1px solid $border-color;
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
  border-top: 1px solid $border-color;
  padding: 4px 10px;
  gap: 8px;
}

.community span {
  display: block;
  color: $grey-600;
  font-size: 11px;
  line-height: 14px;
  font-weight: 400;
}

.community strong {
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
}

.present {
  color: $notification-pass;
  font-size: 11px;
}

.absent {
  color: $grey-600;
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
  color: $body-color;
}

.score-ring svg {
  display: block;
  width: 100%;
  height: 100%;
}

.ring-track {
  fill: none;
  stroke: $progress-bg;
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
  color: $body-color;
}

.ring-number small {
  font-size: 11px;
  font-weight: 400;
  line-height: 13px;
  color: $grey-600;
}

.score-caption {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.score-caption .statlabel {
  font-size: 12px;
  font-weight: 600;
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
    border-top: 1px solid $border-color;
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

@media (min-width: 1400px) {
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

  .score-caption .statlabel {
    font-size: 15px;
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
  .stat.score-stat {
    padding: 10px 12px;
    gap: 14px;
  }

  .score-ring {
    width: 60px;
    height: 60px;
    flex-basis: 60px;
  }
}
</style>
