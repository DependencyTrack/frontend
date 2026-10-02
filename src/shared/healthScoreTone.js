const HEALTH_SCORE_COLOR = {
  green: 'var(--severity-low)',
  yellow: 'var(--severity-medium)',
  orange: 'var(--severity-high)',
  red: 'var(--severity-critical)',
};

function parseHealthScore(raw) {
  if (raw == null || raw === '') {
    return null;
  }
  const score = Number(raw);
  if (!Number.isFinite(score) || score < 0 || score > 10) {
    return null;
  }
  return score;
}

function healthScoreTone(score) {
  const value = parseHealthScore(score);
  if (value == null) {
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

export { HEALTH_SCORE_COLOR, healthScoreTone, parseHealthScore };
