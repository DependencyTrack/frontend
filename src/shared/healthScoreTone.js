// Text tokens, because the severity fills are too light to read on the light theme.
const HEALTH_SCORE_COLOR = {
  green: 'var(--dt-severity-low-text)',
  yellow: 'var(--dt-severity-medium-text)',
  orange: 'var(--dt-severity-high-text)',
  red: 'var(--dt-severity-critical-text)',
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
