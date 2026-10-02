const SCORECARD_RISK = {
  'Binary-Artifacts': 'high',
  'Branch-Protection': 'high',
  'CII-Best-Practices': 'low',
  'Code-Review': 'high',
  'Dangerous-Workflow': 'critical',
  Fuzzing: 'medium',
  License: 'low',
  Maintained: 'high',
  'Pinned-Dependencies': 'medium',
  SAST: 'medium',
  'Security-Policy': 'medium',
  'Signed-Releases': 'high',
  'Token-Permissions': 'high',
};

const RISK_RANK = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  unknown: 4,
};

function scorecardRisk(name) {
  if (
    typeof name !== 'string' ||
    !Object.prototype.hasOwnProperty.call(SCORECARD_RISK, name)
  ) {
    return 'unknown';
  }
  return SCORECARD_RISK[name];
}

function compareScore(left, right) {
  if (left.scored !== right.scored) {
    return left.scored ? -1 : 1;
  }
  if (left.scored && left.numeric !== right.numeric) {
    return left.numeric - right.numeric;
  }
  return 0;
}

function compareRisk(left, right) {
  return RISK_RANK[left.risk] - RISK_RANK[right.risk];
}

function compareScorecardChecks(left, right, mode, locale) {
  const byScoreFirst = mode !== 'risk';
  const primary = byScoreFirst
    ? compareScore(left, right)
    : compareRisk(left, right);
  if (primary !== 0) {
    return primary;
  }
  const secondary = byScoreFirst
    ? compareRisk(left, right)
    : compareScore(left, right);
  if (secondary !== 0) {
    return secondary;
  }
  const nameDelta = left.title.localeCompare(right.title, locale, {
    sensitivity: 'base',
  });
  if (nameDelta !== 0) {
    return nameDelta;
  }
  return left.inputIndex - right.inputIndex;
}

export { SCORECARD_RISK, scorecardRisk, compareScorecardChecks };
