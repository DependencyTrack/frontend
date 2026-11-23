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
      ok-only
      :ok-title="$t('message.close')"
      ok-variant="secondary"
      @hidden="restoreFocus"
    >
      <template v-slot:title>
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
              :class="{ 'is-warn': detail.startsWith('Warn:') }"
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

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { compareScorecardChecks, scorecardRisk } from './scorecardRisk';
import { parseHealthScore } from '@/shared/healthScoreTone';

const ACRONYMS = new Set(['CI', 'CII', 'SAST']);
const RISK_LABELS = {
  critical: 'severity.critical',
  high: 'severity.high',
  medium: 'severity.medium',
  low: 'severity.low',
  unknown: 'message.health_unknown',
};
const URL_PATTERN = /https?:\/\/[^\s)]+/g;

const props = defineProps({
  checks: { type: Array, default: () => [] },
  sortMode: { type: String, default: 'score' },
});

const { t, locale } = useI18n();
const detailsOpen = ref(false);
const selectedCheck = ref(null);
let focusReturn = null;

const sortedChecks = computed(() =>
  props.checks
    .map(normalizeCheck)
    .sort((left, right) =>
      compareScorecardChecks(left, right, props.sortMode, locale.value),
    ),
);

function normalizeCheck(check, index) {
  const numeric = parseHealthScore(check.score);
  const scored = numeric != null;
  const name = check.name || '';
  const risk = scorecardRisk(name);
  return {
    name,
    rowKey: name || 'check-' + index,
    inputIndex: index,
    risk,
    riskLabel: t(RISK_LABELS[risk]),
    title: checkTitle(name),
    numeric,
    scored,
    scoreLabel: scored
      ? t('message.health_scorecard_score_out_of', { score: numeric })
      : t('message.health_missing'),
    barPercent: scored ? (numeric / 10) * 100 : 0,
    description: check.description || '',
    reason: check.reason || '',
    details: (check.details || []).filter(Boolean),
    documentationUrl: check.documentation_url || '',
  };
}

function checkTitle(name) {
  return name
    .split('-')
    .map((part) => {
      if (ACRONYMS.has(part)) {
        return part;
      }
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function openDetails(check, event) {
  focusReturn = event.currentTarget;
  selectedCheck.value = check;
  detailsOpen.value = true;
}

function restoreFocus() {
  focusReturn?.focus();
  focusReturn = null;
}

function linkParts(text) {
  const parts = [];
  let lastIndex = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index) });
    }
    parts.push({ text: match[0], href: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }
  return parts;
}
</script>

<style scoped>
.scorecard-checks {
  box-sizing: border-box;
  min-width: 0;
  color: var(--dt-text);
}

.scorecard-checks * {
  box-sizing: border-box;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  background-color: var(--dt-surface-card);
  font-size: 12px;
  line-height: 16px;
}

th {
  height: 22px;
  padding: 0 10px;
  text-align: left;
  font-size: 11px;
  font-weight: 400;
  color: var(--dt-text-strong);
  background: transparent;
  border-bottom: 1px solid var(--dt-border);
}

[data-bs-theme='light'] th {
  background: var(--dt-surface-recessed);
}

td {
  height: 18px;
  padding: 0 10px;
  background-color: var(--dt-surface-card);
  border-bottom: 1px solid var(--dt-border);
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
  border: 1px solid var(--dt-border-control);
  border-radius: 0.25rem;
  background-color: var(--dt-surface-recessed);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

.risk-badge.is-critical {
  color: var(--dt-severity-critical-text);
}

.risk-badge.is-high {
  color: var(--dt-severity-high-text);
}

.risk-badge.is-medium {
  color: var(--dt-severity-medium-text);
}

.risk-badge.is-low {
  color: var(--dt-severity-low-text);
}

.risk-badge.is-unknown {
  color: var(--dt-severity-unassigned-text);
}

.check-name {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: var(--dt-accent);
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
  background-image: linear-gradient(var(--dt-hover), var(--dt-hover));
}

.check-row:hover .check-name,
.check-row:focus-within .check-name {
  overflow: visible;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.meter {
  height: 4px;
  background: var(--dt-line);
  border-radius: 2px;
}

.meter span {
  display: block;
  height: 4px;
  background: var(--dt-accent);
  border-radius: 2px;
}

.empty {
  margin: 0;
  padding: 8px 10px;
  color: var(--dt-text-muted);
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

<style>
.scorecard-details-modal .modal-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.scorecard-label {
  margin-bottom: 0.25rem;
  color: var(--dt-text-heading);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.scorecard-detail-scoreline {
  margin-bottom: 0.75rem;
}

.scorecard-detail-score {
  color: var(--dt-text-heading);
  font-size: 1.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.scorecard-detail-list {
  max-height: 18rem;
  margin: 0;
  padding: 0.75rem 0.75rem 0.75rem 1.5rem;
  overflow: auto;
  border: 1px solid var(--dt-border);
  border-radius: 0.25rem;
  background: var(--dt-surface-recessed);
  color: var(--dt-text);
  font-family: var(--bs-font-monospace);
  font-size: 0.8125rem;
}

.scorecard-detail-list li + li {
  margin-top: 0.35rem;
}

.scorecard-detail-list li.is-warn {
  color: var(--dt-severity-high-text);
}
</style>
