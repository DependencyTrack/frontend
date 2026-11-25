export const NODE_WIDTH = 272;
export const NODE_HEIGHT = 56;
export const SEVERITY_ORDER = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'INFO',
  'UNASSIGNED',
];
const SEVERITY_RANKS = new Map(
  SEVERITY_ORDER.map((severity, index) => [severity, index]),
);
const DEFAULT_FINDINGS_PAGE_SIZE = 1000;
const DEFAULT_FINDINGS_MAX_PAGES = 50;
const ARROW_LENGTH = 8;
const ARROW_HALF_WIDTH = 4;

export function normalizeSeverity(severity) {
  if (typeof severity === 'string') {
    const normalized = severity.trim().toUpperCase();
    if (SEVERITY_RANKS.has(normalized)) return normalized;
  }
  return 'UNASSIGNED';
}

export function severityRank(severity) {
  return SEVERITY_RANKS.get(normalizeSeverity(severity));
}

function emptySeverityCounts() {
  return Object.fromEntries(SEVERITY_ORDER.map((severity) => [severity, 0]));
}

function findingIdentity(finding) {
  if (finding.vulnerability?.uuid) return finding.vulnerability.uuid;
  if (finding.vulnerability?.source && finding.vulnerability?.vulnId) {
    return `${finding.vulnerability.source}:${finding.vulnerability.vulnId}`;
  }
  return finding.matrix ?? null;
}

export function summarizeFindingsByComponent(findings) {
  const summaries = new Map();
  if (!Array.isArray(findings)) return summaries;

  const seenByComponent = new Map();
  for (const finding of findings) {
    const componentUuid = finding?.component?.uuid;
    if (!componentUuid || finding.analysis?.isSuppressed === true) continue;

    const identity = findingIdentity(finding);
    if (identity !== null) {
      let seen = seenByComponent.get(componentUuid);
      if (!seen) {
        seen = new Set();
        seenByComponent.set(componentUuid, seen);
      }
      if (seen.has(identity)) continue;
      seen.add(identity);
    }

    const severity = normalizeSeverity(finding.vulnerability?.severity);
    let summary = summaries.get(componentUuid);
    if (!summary) {
      summary = {
        total: 0,
        highestSeverity: severity,
        counts: emptySeverityCounts(),
      };
      summaries.set(componentUuid, summary);
    }
    summary.total++;
    summary.counts[severity]++;
    if (severityRank(severity) < severityRank(summary.highestSeverity)) {
      summary.highestSeverity = severity;
    }
  }
  return summaries;
}

export function formatVulnerabilityBreakdown(summary, translateSeverity) {
  if (!summary?.total) return '';
  return SEVERITY_ORDER.filter((severity) => summary.counts?.[severity] > 0)
    .map(
      (severity) =>
        `${summary.counts[severity]} ${translateSeverity(severity)}`,
    )
    .join(', ');
}

export function formatVulnerabilityBadge(
  summary,
  translateSeverity,
  formatUniform,
  formatMixed,
) {
  if (!summary?.total) return '';
  const highest = normalizeSeverity(summary.highestSeverity);
  const highestCount = summary.counts?.[highest] ?? summary.total;
  const otherCount = Math.max(0, summary.total - highestCount);
  const severity = translateSeverity(highest);
  if (otherCount > 0) {
    return formatMixed({ count: highestCount, severity, otherCount });
  }
  return formatUniform({ count: highestCount, severity });
}

export function visibleSeverities(
  visibleUuids,
  vulnerabilitiesByComponent,
  nodes = null,
) {
  if (!visibleUuids || !vulnerabilitiesByComponent?.size) return [];
  const present = new Set();
  for (const uuid of visibleUuids) {
    if (nodes && nodes.get(uuid)?.type !== 'COMPONENT') continue;
    const summary = vulnerabilitiesByComponent.get(uuid);
    if (summary?.total > 0) {
      present.add(normalizeSeverity(summary.highestSeverity));
    }
  }
  return SEVERITY_ORDER.filter((severity) => present.has(severity));
}

function readTotalCountHeader(headers) {
  if (!headers) return null;
  const raw =
    typeof headers.get === 'function'
      ? headers.get('x-total-count')
      : (headers['x-total-count'] ?? headers['X-Total-Count']);
  if (raw === undefined || raw === null || raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function abortError(signal) {
  if (signal?.reason instanceof Error) return signal.reason;
  const error = new Error('The operation was aborted.');
  error.name = 'AbortError';
  return error;
}

export async function fetchProjectFindings(
  url,
  {
    get,
    signal,
    pageSize = DEFAULT_FINDINGS_PAGE_SIZE,
    maxPages = DEFAULT_FINDINGS_MAX_PAGES,
  } = {},
) {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const safeMaxPages = Math.max(1, Math.floor(maxPages));
  const findings = [];
  let total = null;
  let truncated = false;

  for (let pageNumber = 1; pageNumber <= safeMaxPages; pageNumber++) {
    if (signal?.aborted) throw abortError(signal);
    const response = await get(url, {
      params: { suppressed: false, pageNumber, pageSize: safePageSize },
      signal,
    });
    if (signal?.aborted) throw abortError(signal);
    const items = Array.isArray(response?.data) ? response.data : [];
    findings.push(...items);
    const headerTotal = readTotalCountHeader(response?.headers);
    if (headerTotal !== null) total = headerTotal;
    if (
      items.length < safePageSize ||
      (total !== null && findings.length >= total)
    ) {
      break;
    }
    if (pageNumber === safeMaxPages) {
      truncated = total === null || findings.length < total;
    }
  }
  return { findings, truncated, total };
}

export function collectReachable(starts, neighborsOf) {
  const reached = new Set();
  const pending = [...starts];
  while (pending.length > 0) {
    const uuid = pending.pop();
    if (reached.has(uuid)) continue;
    reached.add(uuid);
    for (const neighbor of neighborsOf(uuid)) {
      pending.push(neighbor);
    }
  }
  return reached;
}

function parentsByChild(nodes) {
  const parents = new Map();
  for (const { uuid, direct_dependencies } of nodes.values()) {
    for (const child of direct_dependencies) {
      if (!parents.has(child)) parents.set(child, []);
      parents.get(child).push(uuid);
    }
  }
  return parents;
}

export function findNodesOnPaths(nodes, root, searched) {
  const parents = parentsByChild(nodes);
  const reachable = collectReachable(
    nodes.has(root) ? [root] : [],
    (uuid) => nodes.get(uuid).direct_dependencies,
  );
  const leading = collectReachable(
    [...searched].filter((uuid) => reachable.has(uuid)),
    (uuid) => parents.get(uuid) ?? [],
  );
  return {
    pathNodes: new Set([...leading].filter((uuid) => reachable.has(uuid))),
    found: searched.size === 0 || leading.size > 0,
  };
}

export function findShortestPath(nodes, root, target) {
  const previous = new Map([[root, null]]);
  const queue = [root];
  for (let head = 0; head < queue.length && !previous.has(target); head++) {
    const children = [...nodes.get(queue[head]).direct_dependencies].sort(
      (a, b) => nodes.get(a).name.localeCompare(nodes.get(b).name),
    );
    for (const child of children) {
      if (!previous.has(child)) {
        previous.set(child, queue[head]);
        queue.push(child);
      }
    }
  }
  const path = [target];
  while (previous.get(path.at(-1))) {
    path.push(previous.get(path.at(-1)));
  }
  return path.reverse();
}

export function collectVisibleNodes(nodes, root, expanded, pinned) {
  return collectReachable(nodes.has(root) ? [root] : [], (uuid) =>
    nodes
      .get(uuid)
      .direct_dependencies.filter(
        (child) => expanded.has(uuid) || pinned.has(child),
      ),
  );
}

export function collectVisibleEdges(nodes, visible) {
  return [...visible].flatMap((uuid) =>
    nodes
      .get(uuid)
      .direct_dependencies.filter((child) => visible.has(child))
      .map((child) => [uuid, child]),
  );
}

export function wheelScrollsPage({ top, bottom }, windowHeight, deltaY) {
  if (deltaY > 0) return bottom > windowHeight;
  if (deltaY < 0) return top < 0;
  return false;
}

export function expansionToggleLabel(children, expanded, visible) {
  if (expanded && children.length > 0) return '−';
  const hidden = children.filter((child) => !visible.has(child)).length;
  return hidden > 0 ? `+${hidden}` : null;
}

const { compare } = new Intl.Collator(undefined, { numeric: true });

export function searchNodes(nodes, query) {
  const lowerQuery = query.toLowerCase();
  if (!lowerQuery) return [];
  return [...nodes.values()]
    .filter(
      (node) =>
        node.type !== 'PROJECT' &&
        nodeLabel(node).toLowerCase().includes(lowerQuery),
    )
    .sort(
      (a, b) =>
        compare(a.name, b.name) ||
        compare(a.group ?? '', b.group ?? '') ||
        compare(a.version ?? '', b.version ?? ''),
    );
}

export function nodeRoute({ uuid, type }) {
  if (type === 'COMPONENT') return `/components/${uuid}`;
  if (type === 'SERVICE') return `/services/${uuid}`;
  return null;
}

export function nodeLabel({ group, name, version }) {
  return [group ? `${group}/${name}` : name, version].filter(Boolean).join(' ');
}

export function searchResultLabel({ group, name, version }) {
  return [name, version, group && `/ ${group}`].filter(Boolean).join(' ');
}

export function nextDrawnArea(view, previous) {
  const width = view.right - view.left;
  const height = view.bottom - view.top;
  if (
    previous &&
    view.left >= previous.left &&
    view.top >= previous.top &&
    view.right <= previous.right &&
    view.bottom <= previous.bottom &&
    previous.right - previous.left <= 3 * width
  ) {
    return previous;
  }
  return {
    left: view.left - width / 2,
    top: view.top - height / 2,
    right: view.right + width / 2,
    bottom: view.bottom + height / 2,
  };
}

export function nodesInArea(nodes, { left, top, right, bottom }, keptUuid) {
  return nodes.filter(
    ({ uuid, x, y }) =>
      uuid === keptUuid ||
      (x + NODE_WIDTH > left &&
        x < right &&
        y + NODE_HEIGHT > top &&
        y < bottom),
  );
}

export function nodeCenter({ x, y }) {
  return { x: x + NODE_WIDTH / 2, y: y + NODE_HEIGHT / 2 };
}

export function nearestNode(nodes, point) {
  const distance = (node) => {
    const center = nodeCenter(node);
    return Math.hypot(center.x - point.x, center.y - point.y);
  };
  return nodes.reduce((closest, node) =>
    distance(node) < distance(closest) ? node : closest,
  );
}

export function boundingBox(nodes) {
  const box = {
    left: Infinity,
    top: Infinity,
    right: -Infinity,
    bottom: -Infinity,
  };
  for (const { x, y } of nodes) {
    box.left = Math.min(box.left, x);
    box.top = Math.min(box.top, y);
    box.right = Math.max(box.right, x + NODE_WIDTH);
    box.bottom = Math.max(box.bottom, y + NODE_HEIGHT);
  }
  return box;
}

export function scaleToFit(view, content, margin) {
  return Math.min(
    1,
    (view.width - 2 * margin) / content.width,
    (view.height - 2 * margin) / content.height,
  );
}

export function centerOrClampOffset(offset, view, content, margin) {
  if (content + 2 * margin <= view) return (view - content) / 2;
  return Math.min(Math.max(offset, view - content - margin), margin);
}

export function panToShowRange(start, end, view, margin) {
  if (end - start + 2 * margin > view) return 0;
  if (start < margin) return margin - start;
  if (end > view - margin) return view - margin - end;
  return 0;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

export function edgeLinePath(points) {
  const [first, ...rest] = points;
  const last = rest.pop();
  let path = `M${round(first.x)},${round(first.y)}`;
  rest.forEach((point, i) => {
    const next = rest[i + 1] ?? last;
    path += `Q${round(point.x)},${round(point.y)} ${round((point.x + next.x) / 2)},${round((point.y + next.y) / 2)}`;
  });
  return `${path}L${round(last.x)},${round(last.y)}`;
}

export function edgeArrowPath(points) {
  const tip = points[points.length - 1];
  const before = points[points.length - 2];
  const length = Math.hypot(tip.x - before.x, tip.y - before.y) || 1;
  const dx = (tip.x - before.x) / length;
  const dy = (tip.y - before.y) / length;
  const baseX = tip.x - dx * ARROW_LENGTH;
  const baseY = tip.y - dy * ARROW_LENGTH;
  return (
    `M${round(tip.x)},${round(tip.y)}` +
    `L${round(baseX - dy * ARROW_HALF_WIDTH)},${round(baseY + dx * ARROW_HALF_WIDTH)}` +
    `L${round(baseX + dy * ARROW_HALF_WIDTH)},${round(baseY - dx * ARROW_HALF_WIDTH)}Z`
  );
}

export function mergeEdgePaths(edges) {
  return {
    lines: edges.map(({ path }) => path).join(''),
    arrows: edges.map(({ arrow }) => arrow).join(''),
  };
}
