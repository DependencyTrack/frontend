import { parseHealthScore } from './healthScoreTone';

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
    formatter: formatScorecardScore,
  };
}

export { buildScorecardColumn, formatScorecardScore };
