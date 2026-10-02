function at(year, month, day, hours, minutes, seconds) {
  return new Date(year, month - 1, day, hours, minutes, seconds || 0).getTime();
}

const componentHealthFixture = {
  status: 'PROCESSED',
  last_fetch: at(2026, 10, 1, 19, 36, 42),
  project_metadata_observed_at: at(2026, 9, 28, 5, 58, 36),
  scorecard_timestamp: at(2026, 8, 24, 2, 0, 0),
  scorecard_reference_version: 'v5.5.1-0.20260815060127-d1fab88f5463',
  scorecard_score: 9.7,
  github_url: 'https://github.com/cure53/DOMPurify',
  deps_dev_url: 'https://deps.dev/npm/dompurify/1.0.8',
  last_commit: at(2026, 9, 26, 12, 0, 0),
  is_repo_archived: false,
  contributors: 136,
  commit_frequency_weekly: 3.8,
  open_issues: 0,
  open_prs: 0,
  avg_issue_age_days: 0,
  bus_factor: 1,
  files: 116,
  stars: 17413,
  forks: 860,
  dependents: 15370,
  has_readme: true,
  has_code_of_conduct: true,
  has_security_policy: true,
  scorecard_checks: [
    { name: 'CII-Best-Practices', score: 7 },
    { name: 'Branch-Protection', score: 8 },
    { name: 'Binary-Artifacts', score: 10 },
    { name: 'Code-Review', score: 10 },
    { name: 'Dangerous-Workflow', score: 10 },
    { name: 'Fuzzing', score: 10 },
    { name: 'License', score: 10 },
    { name: 'Maintained', score: 10 },
    { name: 'Pinned-Dependencies', score: 10 },
    { name: 'SAST', score: 10 },
    { name: 'Security-Policy', score: 10 },
    { name: 'Signed-Releases', score: 10 },
    { name: 'Token-Permissions', score: 10 },
  ],
};

export { componentHealthFixture };
