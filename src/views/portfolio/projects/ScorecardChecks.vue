<template>
  <div>
    <div class="scorecard-board">
      <div v-if="showOverallScore" class="scorecard-general">
        <span class="scorecard-general-value" :class="scoreClass(score)">{{
          $t('message.health_scorecard_score_out_of', {
            score: formatOverallScore(score),
          })
        }}</span>
      </div>
      <ul v-if="normalizedChecks.length" class="scorecard-checks">
        <li
          v-for="check in normalizedChecks"
          :key="check.name"
          class="scorecard-check"
        >
          <span class="scorecard-check-name">{{ checkTitle(check.name) }}</span>
          <span
            class="scorecard-check-score"
            :class="scoreClass(check.score)"
            >{{ formatScore(check.score) }}</span
          >
          <button
            type="button"
            class="scorecard-check-action"
            @click="openDetails(check)"
          >
            {{ $t('message.health_show_details') }}
          </button>
        </li>
      </ul>
      <p v-else class="scorecard-empty mb-0">
        {{ $t('message.health_no_checks') }}
      </p>
    </div>

    <b-modal
      v-model="detailsOpen"
      modal-class="scorecard-details-modal"
      size="lg"
      scrollable
      centered
      :title="selectedCheck ? checkTitle(selectedCheck.name) : ''"
      :ok-title="$t('message.close')"
      ok-only
      ok-variant="secondary"
    >
      <div v-if="selectedCheck">
        <div class="scorecard-detail-scoreline">
          <span
            class="scorecard-detail-score"
            :class="scoreClass(selectedCheck.score)"
            >{{ formatScore(selectedCheck.score) }}</span
          >
        </div>
        <p v-if="selectedCheck.description" class="text-muted">
          {{ selectedCheck.description }}
        </p>
        <div v-if="selectedCheck.reason" class="mb-3">
          <div class="scorecard-label">{{ $t('message.health_reason') }}</div>
          <p class="mb-0">{{ selectedCheck.reason }}</p>
        </div>
        <div class="mb-3">
          <div class="scorecard-label">
            {{ $t('message.health_scorecard_details') }}
          </div>
          <ul v-if="selectedCheck.details.length" class="scorecard-detail-list">
            <li
              v-for="(detail, index) in selectedCheck.details"
              :key="index"
              :class="detailClass(detail)"
            >
              <span
                v-for="(part, partIndex) in linkParts(detail)"
                :key="partIndex"
              >
                <a
                  v-if="part.href"
                  :href="part.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ part.text }}</a
                >
                <template v-else>{{ part.text }}</template>
              </span>
            </li>
          </ul>
          <p v-else class="text-muted mb-0">
            {{ $t('message.health_scorecard_no_details') }}
          </p>
        </div>
        <a
          v-if="selectedCheck.documentationUrl"
          :href="selectedCheck.documentationUrl"
          target="_blank"
          rel="noopener noreferrer"
          >{{ $t('message.health_scorecard_documentation') }}
          <i class="fa fa-external-link" aria-hidden="true"></i
        ></a>
      </div>
    </b-modal>
  </div>
</template>

<script>
const ACRONYMS = new Set(['CI', 'CII', 'SAST']);

export default {
  name: 'ScorecardChecks',
  props: {
    checks: {
      type: Array,
      default: () => [],
    },
    score: {
      default: null,
    },
  },
  data() {
    return {
      detailsOpen: false,
      selectedCheck: null,
    };
  },
  computed: {
    normalizedChecks() {
      return (this.checks || [])
        .map((check) => this.normalizeCheck(check))
        .filter((check) => {
          const score = Number(check.score);
          return !Number.isNaN(score) && score >= 0;
        });
    },
    showOverallScore() {
      const score = Number(this.score);
      return (
        this.score != null &&
        this.score !== '' &&
        !Number.isNaN(score) &&
        score >= 0
      );
    },
  },
  methods: {
    normalizeCheck(check) {
      const documentation =
        check && typeof check.documentation === 'object'
          ? check.documentation
          : {};
      const rawDetails = check && check.details;
      const details = Array.isArray(rawDetails)
        ? rawDetails.map((detail) => this.detailText(detail)).filter(Boolean)
        : [];
      return {
        name: (check && check.name) || '',
        score: check ? check.score : null,
        description:
          (check && (check.description || documentation.short)) || '',
        reason: (check && check.reason) || '',
        details,
        documentationUrl:
          (check && (check.documentation_url || documentation.url)) || '',
      };
    },
    detailText(detail) {
      if (detail == null) {
        return '';
      }
      if (typeof detail === 'string') {
        return detail;
      }
      if (typeof detail === 'object') {
        return detail.message || detail.text || '';
      }
      return String(detail);
    },
    checkTitle(name) {
      if (!name) {
        return '';
      }
      return String(name)
        .split('-')
        .map((part, index) => {
          if (ACRONYMS.has(part) && part === part.toUpperCase()) {
            return part;
          }
          const lower = part.toLowerCase();
          if (index === 0) {
            return lower.charAt(0).toUpperCase() + lower.slice(1);
          }
          return lower;
        })
        .join(' ');
    },
    formatOverallScore(value) {
      if (value == null || value === '') {
        return this.$t('message.health_not_applicable');
      }
      const score = Number(value);
      if (Number.isNaN(score)) {
        return this.$t('message.health_not_applicable');
      }
      if (score < 0) {
        return '-1';
      }
      return score.toFixed(1);
    },
    formatScore(value) {
      if (value == null || value === '') {
        return this.$t('message.health_not_applicable');
      }
      const score = Number(value);
      if (Number.isNaN(score)) {
        return this.$t('message.health_not_applicable');
      }
      if (score < 0) {
        return '-1';
      }
      if (Number.isInteger(score)) {
        return String(score);
      }
      return score.toFixed(1);
    },
    scoreClass(value) {
      const score = Number(value);
      if (value == null || value === '' || Number.isNaN(score) || score < 0) {
        return 'is-unknown';
      }
      if (score >= 7) {
        return 'is-high';
      }
      if (score >= 4) {
        return 'is-medium';
      }
      return 'is-low';
    },
    detailClass(detail) {
      if (typeof detail === 'string' && detail.startsWith('Warn:')) {
        return 'is-warn';
      }
      return '';
    },
    openDetails(check) {
      this.selectedCheck = check;
      this.detailsOpen = true;
    },
    linkParts(text) {
      const value = text || '';
      const pattern = /https?:\/\/[^\s)]+/g;
      const parts = [];
      let lastIndex = 0;
      let match = pattern.exec(value);
      while (match) {
        if (match.index > lastIndex) {
          parts.push({ text: value.slice(lastIndex, match.index) });
        }
        parts.push({ text: match[0], href: match[0] });
        lastIndex = match.index + match[0].length;
        match = pattern.exec(value);
      }
      if (lastIndex < value.length) {
        parts.push({ text: value.slice(lastIndex) });
      }
      return parts;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/variables';
.scorecard-board {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scorecard-general-value {
  color: $body-color;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.scorecard-checks {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid $border-color;
  border-radius: 0.25rem;
  background: $grey-800;
}

.scorecard-check {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  color: $body-color;
}

.scorecard-check + .scorecard-check {
  border-top: 1px solid $border-color;
}

.scorecard-check-name {
  flex: 1 1 auto;
  min-width: 0;
  color: $body-color;
}

.scorecard-check-score {
  flex: 0 0 auto;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.1;
}

.scorecard-check-action {
  flex: 0 0 auto;
  padding: 0.25rem 0.5rem;
  border: 1px solid $border-color;
  border-radius: 0.25rem;
  background: transparent;
  color: $body-color;
  cursor: pointer;
}

.scorecard-check-action:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 1px;
}

.scorecard-empty {
  color: $body-color;
}

.scorecard-check-score.is-high,
.scorecard-detail-score.is-high,
.scorecard-general-value.is-high {
  color: $green;
}

.scorecard-check-score.is-medium,
.scorecard-detail-score.is-medium,
.scorecard-general-value.is-medium {
  color: $orange;
}

.scorecard-check-score.is-low,
.scorecard-detail-score.is-low,
.scorecard-general-value.is-low {
  color: $red;
}

.scorecard-check-score.is-unknown,
.scorecard-detail-score.is-unknown,
.scorecard-general-value.is-unknown {
  color: $body-color;
}

.scorecard-label {
  margin-bottom: 0.25rem;
  color: $body-color;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.scorecard-detail-scoreline {
  margin-bottom: 0.75rem;
}

.scorecard-detail-score {
  font-size: 1.5rem;
  font-weight: 600;
}

.scorecard-detail-list {
  max-height: 18rem;
  margin: 0;
  padding: 0.75rem 0.75rem 0.75rem 1.5rem;
  overflow: auto;
  border: 1px solid $border-color;
  border-radius: 0.25rem;
  background: $grey-800;
  color: $body-color;
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.8125rem;
}

.scorecard-detail-list li + li {
  margin-top: 0.35rem;
}

.scorecard-detail-list li.is-warn {
  color: $orange;
}
</style>

<style lang="scss">
@import '../../../assets/scss/variables';

.scorecard-details-modal .modal-header .close {
  color: $body-color;
  text-shadow: none;
  opacity: 1;
}

.scorecard-details-modal .modal-header .close:hover,
.scorecard-details-modal .modal-header .close:focus {
  color: $body-color;
  opacity: 0.75;
}
</style>
