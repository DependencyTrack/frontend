const HEALTH_SCORE_COLOR = {
  green: 'var(--severity-low)',
  yellow: 'var(--severity-medium)',
  orange: 'var(--severity-high)',
  red: 'var(--severity-critical)',
};

function healthScoreTone(score) {
  if (score == null || score === '') {
    return null;
  }
  const value = Number(score);
  if (!Number.isFinite(value) || value < 0 || value > 10) {
    return null;
  }
  if (value >= 7.5) {
    return 'green';
  }
  if (value >= 5) {
    return 'yellow';
  }
  if (value >= 2.5) {
    return 'orange';
  }
  return 'red';
}

export { HEALTH_SCORE_COLOR, healthScoreTone };
