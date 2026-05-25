const STATUS_INFO = {
  PASSED: { icon: 'fa-check-circle', color: 'status-passed' },
  FAILED: { icon: 'fa-times-circle', color: 'status-failed' },
  UNKNOWN: { icon: 'fa-question-circle', color: 'status-warning' },
  NO_COMPONENT_HASH: { icon: 'fa-minus-circle', color: 'text-muted' },
};

const FALLBACK = { icon: 'fa-circle-o', color: 'text-muted' };

export const HASH_ALGORITHMS = ['md5', 'sha1', 'sha256', 'sha512'];

export function getHashVerificationStatusInfo(status) {
  return STATUS_INFO[status] || FALLBACK;
}

export function normalizeHashes(hashes) {
  const out = {};
  if (!hashes) return out;
  for (const algo of HASH_ALGORITHMS) {
    const v = hashes[algo];
    if (typeof v === 'string' && v.trim()) {
      out[algo] = v.trim().toLowerCase();
    }
  }
  return out;
}

export function computeHashVerificationStatus(
  componentHashes,
  repositoryHashes,
) {
  const repo = normalizeHashes(repositoryHashes);
  if (Object.keys(repo).length === 0) return null;
  const component = normalizeHashes(componentHashes);
  if (Object.keys(component).length === 0) return 'NO_COMPONENT_HASH';
  let common = false;
  let anyFailed = false;
  for (const algo of HASH_ALGORITHMS) {
    if (algo in repo && algo in component) {
      common = true;
      if (repo[algo] !== component[algo]) anyFailed = true;
    }
  }
  if (!common) return 'UNKNOWN';
  return anyFailed ? 'FAILED' : 'PASSED';
}
