function formatScorecardScore(value) {
  if (value == null || value === '') {
    return '-';
  }
  const score = Number(value);
  if (Number.isNaN(score)) {
    return '-';
  }
  return score.toFixed(1);
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
