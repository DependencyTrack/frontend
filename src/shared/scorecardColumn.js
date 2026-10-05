import xssFilters from 'xss-filters';
import { parseHealthScore } from './healthScoreTone';
// Styles for `.scorecard-score-hint` must be global (bootstrap-table
// formatters render outside any Vue SFC's scoped style scope).
import './scorecardColumn.css';

function formatScorecardScore(value) {
  const score = parseHealthScore(value);
  return score == null ? '-' : score.toFixed(1);
}

function buildScorecardColumn({ $t, visible }) {
  return {
    title: $t('message.scorecard'),
    field: 'scorecard_score',
    sortable: true,
    visible,
    class: 'tight',
    formatter(value) {
      const score = formatScorecardScore(value);
      if (score === '-') {
        return score;
      }
      const hint = xssFilters.inDoubleQuotedAttr(
        $t('message.scorecard_current_repository_hint'),
      );
      return (
        `<span class="scorecard-score-hint" data-toggle="tooltip" data-placement="bottom" ` +
        `title="${hint}">${xssFilters.inHTMLData(score)}</span>`
      );
    },
  };
}

export { buildScorecardColumn, formatScorecardScore };
