<template>
  <div class="scorecard-checks">
    <table v-if="sortedChecks.length" :aria-label="$t('message.scorecard')">
      <thead>
        <tr>
          <th scope="col">{{ $t('message.health_checks_practices') }}</th>
          <th scope="col">{{ $t('message.health_risk') }}</th>
          <th scope="col">{{ $t('message.health_scale') }}</th>
          <th scope="col">{{ $t('message.score') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="check in sortedChecks" :key="check.rowKey" class="check-row">
          <td>
            <button
              type="button"
              class="check-name"
              aria-haspopup="dialog"
              @click.stop="openDetails(check, $event)"
            >
              {{ check.title }}
            </button>
          </td>
          <td>
            <span class="risk-badge" :class="'is-' + check.risk">{{
              check.riskLabel
            }}</span>
          </td>
          <td>
            <div class="meter" aria-hidden="true">
              <span :style="{ width: check.barPercent + '%' }"></span>
            </div>
          </td>
          <td>{{ check.scoreLabel }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">{{ $t('message.health_no_checks') }}</p>

    <b-modal
      v-model="detailsOpen"
      modal-class="scorecard-details-modal"
      size="lg"
      scrollable
      centered
      hide-header-close
      :ok-title="$t('message.close')"
      ok-only
      ok-variant="secondary"
      @hidden="restoreFocus"
    >
      <template v-slot:modal-title>
        <span>{{ selectedCheck ? selectedCheck.title : '' }}</span>
        <span
          v-if="selectedCheck"
          class="risk-badge"
          :class="'is-' + selectedCheck.risk"
          >{{ selectedCheck.riskLabel }}</span
        >
      </template>
      <div v-if="selectedCheck">
        <div class="scorecard-detail-scoreline">
          <span class="scorecard-detail-score">{{
            selectedCheck.scoreLabel
          }}</span>
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
import { compareScorecardChecks, scorecardRisk } from './scorecardRisk';
import { parseHealthScore } from './healthScoreTone';

const ACRONYMS = new Set(['CI', 'CII', 'SAST']);
const RISK_LABELS = {
  critical: 'severity.critical',
  high: 'severity.high',
  medium: 'severity.medium',
  low: 'severity.low',
  unknown: 'message.health_unknown',
};

export default {
  name: 'ScorecardChecks',
  props: {
    checks: {
      type: Array,
      default: () => [],
    },
    sortMode: {
      type: String,
      default: 'score',
    },
  },
  data() {
    return {
      detailsOpen: false,
      selectedCheck: null,
      focusReturn: null,
    };
  },
  computed: {
    missingLabel() {
      return this.$t('message.health_missing');
    },
    sortedChecks() {
      const locale = this.$i18n.locale;
      return (this.checks || [])
        .map((check, index) => this.normalizeCheck(check, index))
        .sort((left, right) =>
          compareScorecardChecks(left, right, this.sortMode, locale),
        );
    },
  },
  methods: {
    normalizeCheck(check, index) {
      const documentation =
        check && typeof check.documentation === 'object'
          ? check.documentation
          : {};
      const rawDetails = check && check.details;
      const details = Array.isArray(rawDetails)
        ? rawDetails.map((detail) => this.detailText(detail)).filter(Boolean)
        : [];
      const score = check ? check.score : null;
      const numeric = parseHealthScore(score);
      const scored = numeric != null;
      const name = (check && check.name) || '';
      const risk = scorecardRisk(name);
      return {
        name,
        rowKey: name || 'check-' + index,
        inputIndex: index,
        risk,
        riskLabel: this.$t(RISK_LABELS[risk]),
        title: this.checkTitle(name),
        score,
        numeric,
        scored,
        scoreLabel: scored
          ? this.$t('message.health_scorecard_score_out_of', {
              score: numeric,
            })
          : this.missingLabel,
        barPercent: scored ? (numeric / 10) * 100 : 0,
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
    detailClass(detail) {
      if (typeof detail === 'string' && detail.startsWith('Warn:')) {
        return 'is-warn';
      }
      return '';
    },
    openDetails(check, event) {
      this.focusReturn = event && event.currentTarget;
      this.selectedCheck = check;
      this.detailsOpen = true;
    },
    restoreFocus() {
      const target = this.focusReturn;
      this.focusReturn = null;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
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

.scorecard-checks {
  box-sizing: border-box;
  min-width: 0;
  color: $body-color;
}

.scorecard-checks * {
  box-sizing: border-box;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  background-color: $card-bg;
  font-size: 12px;
  line-height: 16px;
}

th {
  height: 22px;
  padding: 0 10px;
  text-align: left;
  font-size: 11px;
  font-weight: 400;
  color: $table-head-color;
  background: $table-head-bg;
  border-bottom: 1px solid $border-color;
}

td {
  height: 18px;
  padding: 0 10px;
  background-color: $card-bg;
  border-bottom: 1px solid $border-color;
  font-variant-numeric: tabular-nums;
  font-weight: 400;
}

th:nth-child(2),
td:nth-child(2) {
  width: 96px;
  text-align: center;
}

th:nth-child(3),
td:nth-child(3) {
  width: 24%;
}

th:nth-child(4),
td:nth-child(4) {
  width: 73px;
  padding-right: 10px;
  padding-left: 4px;
  white-space: nowrap;
  text-align: right;
}

.risk-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 54px;
  padding: 0.2em 0.4em;
  border: 1px solid $border-color;
  border-radius: 0.25rem;
  background-color: $grey-900;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

.risk-badge.is-critical {
  color: var(--severity-critical);
}

.risk-badge.is-high {
  color: var(--severity-high);
}

.risk-badge.is-medium {
  color: var(--severity-medium);
}

.risk-badge.is-low {
  color: var(--severity-low);
}

.risk-badge.is-unknown {
  color: var(--severity-unassigned);
}

.check-name {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: var(--primary);
  font: inherit;
  font-weight: 400;
  line-height: inherit;
  text-align: left;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.check-row:hover td,
.check-row:focus-within td {
  background: $grey-800;
}

.check-row:hover .check-name,
.check-row:focus-within .check-name {
  overflow: visible;
  color: var(--primary-lighter);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.check-name:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.meter {
  height: 4px;
  background: $progress-bg;
  border-radius: 2px;
}

.meter span {
  display: block;
  height: 4px;
  background: $secondary;
  border-radius: 2px;
}

.empty {
  margin: 0;
  padding: 8px 10px;
  color: $grey-600;
}

@media (min-width: 1400px) {
  table {
    font-size: 14px;
    line-height: 26px;
  }

  td {
    height: 28px;
    padding: 0 16px;
  }

  th {
    height: 30px;
    font-size: 13px;
    padding: 0 16px;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 112px;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 79px;
    padding-right: 16px;
  }

  .risk-badge {
    min-width: 64px;
    padding: 0.2em 0.45em;
    font-size: 12px;
  }
}

@media (max-width: 650px) {
  .scorecard-checks {
    overflow-x: auto;
  }

  table {
    min-width: 540px;
  }

  .check-name {
    overflow: visible;
    text-overflow: unset;
    white-space: normal;
  }
}
</style>

<style lang="scss">
@import '../../../assets/scss/variables';

.scorecard-details-modal .modal-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
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
  color: $body-color;
  font-size: 1.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
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
