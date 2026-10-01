<template>
  <b-card class="m-3" :title="$t('message.health_component_metrics')">
    <div v-if="state === 'loading'" class="text-center py-4">
      {{ $t('message.loading') }}…
    </div>
    <div v-else-if="state === 'empty'" class="text-center py-4">
      {{ $t('message.health_no_metadata') }}
    </div>
    <div v-else-if="state === 'in_progress'" class="text-center py-4">
      {{ $t('message.health_in_progress') }}
    </div>
    <div v-else-if="state === 'not_available'" class="text-center py-4">
      {{ $t('message.health_not_available') }}
    </div>
    <div v-else-if="state === 'error'" class="text-center py-4">
      {{ $t('message.health_load_failed') }}
    </div>
    <div v-else-if="metrics">
      <p class="text-muted small">
        {{ $t('message.health_last_updated') }}: {{ formattedLastFetch }}
      </p>
      <b-row>
        <b-col md="6">
          <dl class="row mb-0">
            <dt class="col-sm-6">{{ $t('message.health_package_url') }}</dt>
            <dd class="col-sm-6">{{ display(metrics.purl) }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_status') }}</dt>
            <dd class="col-sm-6">{{ statusLabel }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_stars') }}</dt>
            <dd class="col-sm-6">{{ display(metrics.stars) }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_forks') }}</dt>
            <dd class="col-sm-6">{{ display(metrics.forks) }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_contributors') }}</dt>
            <dd class="col-sm-6">{{ display(metrics.contributors) }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_weekly_commits') }}</dt>
            <dd class="col-sm-6">
              {{ displayNumber(metrics.commit_frequency_weekly, 2) }}
            </dd>
            <dt class="col-sm-6">{{ $t('message.health_open_issues') }}</dt>
            <dd class="col-sm-6">{{ display(metrics.open_issues) }}</dd>
            <dt class="col-sm-6">
              {{ $t('message.health_open_pull_requests') }}
            </dt>
            <dd class="col-sm-6">{{ display(metrics.open_prs) }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_last_commit') }}</dt>
            <dd class="col-sm-6">{{ formatEpoch(metrics.last_commit) }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_bus_factor') }}</dt>
            <dd class="col-sm-6">{{ display(metrics.bus_factor) }}</dd>
            <dt class="col-sm-6">
              {{ $t('message.health_known_dependents') }}
            </dt>
            <dd class="col-sm-6">{{ display(metrics.dependents) }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_files') }}</dt>
            <dd class="col-sm-6">{{ display(metrics.files) }}</dd>
            <dt class="col-sm-6">{{ $t('message.health_scorecard_score') }}</dt>
            <dd class="col-sm-6">
              {{ displayNumber(metrics.scorecard_score, 1) }}
            </dd>
            <dt class="col-sm-6">
              {{ $t('message.health_average_issue_age') }}
            </dt>
            <dd class="col-sm-6">
              {{ displayNumber(metrics.avg_issue_age_days, 1) }}
            </dd>
            <dt class="col-sm-6">{{ $t('message.health_archived') }}</dt>
            <dd class="col-sm-6">
              {{ displayBoolean(metrics.is_repo_archived) }}
            </dd>
            <dt class="col-sm-6">
              {{ $t('message.health_reference_version') }}
            </dt>
            <dd class="col-sm-6">
              {{ display(metrics.scorecard_reference_version) }}
            </dd>
            <dt class="col-sm-6">
              {{ $t('message.health_scorecard_generated') }}
            </dt>
            <dd class="col-sm-6">
              {{ formatEpoch(metrics.scorecard_timestamp) }}
            </dd>
          </dl>
        </b-col>
        <b-col md="6">
          <h5 class="mb-3">{{ $t('message.health_repository_features') }}</h5>
          <ul class="list-unstyled">
            <li>
              <i
                :class="featureIcon(metrics.has_readme)"
                aria-hidden="true"
              ></i>
              {{ $t('message.health_readme') }}:
              {{ displayBoolean(metrics.has_readme) }}
            </li>
            <li>
              <i
                :class="featureIcon(metrics.has_code_of_conduct)"
                aria-hidden="true"
              ></i>
              {{ $t('message.health_code_of_conduct') }}:
              {{ displayBoolean(metrics.has_code_of_conduct) }}
            </li>
            <li>
              <i
                :class="featureIcon(metrics.has_security_policy)"
                aria-hidden="true"
              ></i>
              {{ $t('message.health_security_policy') }}:
              {{ displayBoolean(metrics.has_security_policy) }}
            </li>
          </ul>
        </b-col>
      </b-row>
      <h5 class="mt-3 mb-3">{{ $t('message.health_scorecard_checks') }}</h5>
      <b-list-group
        v-if="metrics.scorecard_checks && metrics.scorecard_checks.length"
      >
        <b-list-group-item
          v-for="check in metrics.scorecard_checks"
          :key="check.name"
        >
          <div class="d-flex justify-content-between">
            <strong>{{ check.name }}</strong>
            <span v-if="check.score != null"
              >{{ displayNumber(check.score, 1) }}/10</span
            >
          </div>
          <div v-if="check.description" class="text-muted small">
            {{ check.description }}
          </div>
          <div v-if="check.reason">
            <strong>{{ $t('message.health_reason') }}:</strong>
            {{ check.reason }}
          </div>
          <ul v-if="check.details && check.details.length" class="mb-1 mt-2">
            <li v-for="(detail, index) in check.details" :key="index">
              {{ detail }}
            </li>
          </ul>
          <a
            v-if="check.documentation_url"
            :href="check.documentation_url"
            target="_blank"
            rel="noopener noreferrer"
            >{{ $t('message.health_read_more') }}</a
          >
        </b-list-group-item>
      </b-list-group>
      <p v-else class="text-muted">{{ $t('message.health_no_checks') }}</p>
      <p class="text-muted small text-center mt-4 mb-0">
        {{ $t('message.health_attribution_sources') }}
        <a href="https://deps.dev" target="_blank" rel="noopener noreferrer"
          >deps.dev</a
        >
        {{ $t('message.health_attribution_and') }}
        <a
          href="https://docs.github.com/en/rest"
          target="_blank"
          rel="noopener noreferrer"
          >{{ $t('message.health_attribution_github_api') }}</a
        >.
        <br />
        {{ $t('message.health_attribution_disclaimer') }}
      </p>
    </div>
  </b-card>
</template>

<script>
import common from '../../../shared/common';

export default {
  name: 'ComponentHealth',
  props: {
    uuid: String,
  },
  data() {
    return {
      metrics: null,
      state: 'loading',
    };
  },
  computed: {
    formattedLastFetch() {
      return this.formatEpoch(this.metrics && this.metrics.last_fetch);
    },
    statusLabel() {
      if (!this.metrics || !this.metrics.status) {
        return this.$t('message.health_not_applicable');
      }
      const key = `message.health_status_${this.metrics.status.toLowerCase()}`;
      const label = this.$t(key);
      return label === key ? this.metrics.status : label;
    },
  },
  methods: {
    display(value) {
      if (value === null || value === undefined || value === '') {
        return this.$t('message.health_not_applicable');
      }
      return value;
    },
    displayNumber(value, digits) {
      if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
      ) {
        return this.$t('message.health_not_applicable');
      }
      return Number(value).toFixed(digits);
    },
    displayBoolean(value) {
      if (value === true) {
        return this.$t('message.health_yes');
      }
      if (value === false) {
        return this.$t('message.health_no');
      }
      return this.$t('message.health_not_applicable');
    },
    featureIcon(value) {
      if (value === true) {
        return 'fa fa-check text-success mr-1';
      }
      if (value === false) {
        return 'fa fa-times text-danger mr-1';
      }
      return 'fa fa-question text-muted mr-1';
    },
    formatEpoch(value) {
      if (value == null) {
        return this.$t('message.health_not_applicable');
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return this.$t('message.health_not_applicable');
      }
      return common.formatTimestamp(date.getTime(), true);
    },
    fetchMetrics() {
      const url = `${this.$api.BASE_URL}/api/v2/components/${this.uuid}/health`;
      this.axios
        .get(url)
        .then((response) => {
          const data = response.data || {};
          if (data.status === 'IN_PROGRESS') {
            this.state = 'in_progress';
            return;
          }
          if (data.status === 'NOT_AVAILABLE') {
            this.state = 'not_available';
            return;
          }
          this.metrics = data;
          this.state = 'ready';
        })
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            this.state = 'empty';
            return;
          }
          this.state = 'error';
        });
    },
  },
  mounted() {
    this.fetchMetrics();
  },
};
</script>
