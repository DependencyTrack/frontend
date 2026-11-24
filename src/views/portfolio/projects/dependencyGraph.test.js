import { describe, expect, it, vi } from 'vitest';
import {
  SEVERITY_ORDER,
  collectReachable,
  collectVisibleEdges,
  collectVisibleNodes,
  edgeArrowPath,
  expansionToggleLabel,
  fetchProjectFindings,
  findNodesOnPaths,
  findShortestPath,
  formatVulnerabilityBadge,
  formatVulnerabilityBreakdown,
  nextDrawnArea,
  nodesInArea,
  normalizeSeverity,
  searchNodes,
  searchResultLabel,
  severityRank,
  summarizeFindingsByComponent,
  visibleSeverities,
  wheelScrollsPage,
} from './dependencyGraph';

const graph = (adjacency) =>
  new Map(
    Object.entries(adjacency).map(([uuid, direct_dependencies]) => [
      uuid,
      { uuid, name: uuid, type: 'COMPONENT', direct_dependencies },
    ]),
  );
const sorted = (set) => [...set].sort();
const points = (...list) => list.map(([x, y]) => ({ x, y }));

describe('collectReachable', () => {
  const reachableFrom = (starts, adjacency) =>
    sorted(collectReachable(starts, (uuid) => adjacency[uuid] ?? []));

  it('gets through a cycle', () => {
    const adjacency = { a: ['b'], b: ['a', 'c'] };
    expect(reachableFrom(['a'], adjacency)).toEqual(['a', 'b', 'c']);
  });

  it('handles a chain deeper than the call stack', () => {
    const depth = 200_000;
    const reached = collectReachable([0], (n) => (n < depth ? [n + 1] : []));
    expect(reached.size).toBe(depth + 1);
  });
});

describe('findNodesOnPaths', () => {
  const nodes = graph({
    root: ['a', 'b'],
    a: ['target'],
    b: [],
    target: ['leaf'],
    leaf: [],
    orphan: ['target'],
    island: [],
  });
  const find = (...searched) =>
    findNodesOnPaths(nodes, 'root', new Set(searched));

  it('returns only what leads from the root to the target', () => {
    const { found, pathNodes } = find('target');
    expect(found).toBe(true);
    expect(sorted(pathNodes)).toEqual(['a', 'root', 'target']);
  });

  it('reports a component the root cannot reach as not found', () => {
    const { found, pathNodes } = find('island');
    expect(found).toBe(false);
    expect(pathNodes.size).toBe(0);
  });

  it('returns what it can when only some components are in reach', () => {
    const { found, pathNodes } = find('island', 'b');
    expect(found).toBe(true);
    expect(sorted(pathNodes)).toEqual(['b', 'root']);
  });
});

describe('findShortestPath', () => {
  it('takes the shorter of two routes', () => {
    const nodes = graph({ root: ['a', 't'], a: ['t'], t: [] });
    expect(findShortestPath(nodes, 'root', 't')).toEqual(['root', 't']);
  });

  it('returns the path in order when a dependency points back at the root', () => {
    const nodes = graph({ root: ['a'], a: ['root', 't'], t: [] });
    expect(findShortestPath(nodes, 'root', 't')).toEqual(['root', 'a', 't']);
  });
});

describe('collectVisibleNodes', () => {
  const nodes = graph({ root: ['a', 'b'], a: ['c'], b: ['c'], c: [] });
  const visible = ({ expanded = [], pinned = [] }) =>
    sorted(
      collectVisibleNodes(nodes, 'root', new Set(expanded), new Set(pinned)),
    );

  it('shows pinned nodes without expanding their parents', () => {
    expect(visible({ pinned: ['a', 'c'] })).toEqual(['a', 'c', 'root']);
  });
});

describe('collectVisibleEdges', () => {
  it('only includes edges between visible nodes', () => {
    const nodes = graph({ a: ['b', 'c'], b: [], c: [] });
    expect(collectVisibleEdges(nodes, new Set(['a', 'b']))).toEqual([
      ['a', 'b'],
    ]);
  });
});

describe('wheelScrollsPage', () => {
  const cutOffBelow = { top: 300, bottom: 800 };
  const cutOffAbove = { top: -50, bottom: 400 };
  const inView = { top: 100, bottom: 500 };
  const windowHeight = 600;
  const scrollsPage = (rect, deltaY) =>
    wheelScrollsPage(rect, windowHeight, deltaY);

  it('scrolls towards the side that is cut off', () => {
    expect(scrollsPage(cutOffBelow, 100)).toBe(true);
    expect(scrollsPage(cutOffAbove, -100)).toBe(true);
  });

  it('does not scroll away from the side that is cut off', () => {
    expect(scrollsPage(cutOffBelow, -100)).toBe(false);
    expect(scrollsPage(cutOffAbove, 100)).toBe(false);
  });

  it('does not scroll when the graph is fully in view', () => {
    expect(scrollsPage(inView, 100)).toBe(false);
    expect(scrollsPage(inView, -100)).toBe(false);
  });
});

describe('expansionToggleLabel', () => {
  it('gives nothing for a leaf, expanded or not', () => {
    expect(expansionToggleLabel([], false, new Set())).toBeNull();
    expect(expansionToggleLabel([], true, new Set())).toBeNull();
  });

  it('counts the dependencies still hidden', () => {
    expect(expansionToggleLabel(['a', 'b'], false, new Set())).toBe('+2');
    expect(expansionToggleLabel(['a', 'b'], false, new Set(['a']))).toBe('+1');
  });

  it('gives nothing when all dependencies show through other nodes', () => {
    expect(expansionToggleLabel(['a'], false, new Set(['a']))).toBeNull();
  });
});

describe('searchNodes', () => {
  const nodes = new Map(
    [
      { uuid: 'p', name: 'core', type: 'PROJECT' },
      {
        uuid: '1',
        name: 'Zeta',
        group: 'org.core',
        version: '2.5',
        type: 'COMPONENT',
      },
      { uuid: '2', name: 'alpha-CORE', type: 'COMPONENT' },
      { uuid: '3', name: 'other', group: 'org.x', type: 'SERVICE' },
    ].map((node) => [node.uuid, node]),
  );
  const search = (query) => searchNodes(nodes, query).map(({ uuid }) => uuid);

  it('matches name and group ignoring case, sorted by name, without the project', () => {
    expect(search('CoRe')).toEqual(['2', '1']);
  });

  it('matches group/name and a version', () => {
    expect(search('org.core/zeta')).toEqual(['1']);
    expect(search('2.5')).toEqual(['1']);
  });

  it('orders components of the same name by group, then by numeric version', () => {
    const sameName = new Map(
      [
        { uuid: 'b-10', name: 'api', group: 'org.b', version: '1.10.0' },
        { uuid: 'b-9', name: 'api', group: 'org.b', version: '1.9.0' },
        { uuid: 'a', name: 'api', group: 'org.a', version: '2.0.0' },
        { uuid: 'none', name: 'api' },
      ].map((node) => [node.uuid, { type: 'COMPONENT', ...node }]),
    );
    expect(searchNodes(sameName, 'api').map(({ uuid }) => uuid)).toEqual([
      'none',
      'a',
      'b-9',
      'b-10',
    ]);
  });
});

describe('searchResultLabel', () => {
  it('leads with the name and version, so a long group cannot cut them off', () => {
    const node = { group: 'org.example', name: 'core', version: '2.5' };
    expect(searchResultLabel(node)).toBe('core 2.5 / org.example');
  });

  it('leaves out what a component does not have', () => {
    expect(searchResultLabel({ name: 'core' })).toBe('core');
    expect(searchResultLabel({ name: 'core', group: 'org.x' })).toBe(
      'core / org.x',
    );
  });
});

describe('nextDrawnArea', () => {
  const view = (left, top, width, height) => ({
    left,
    top,
    right: left + width,
    bottom: top + height,
  });

  it('keeps the area while panning inside it', () => {
    const area = nextDrawnArea(view(100, 100, 200, 100), null);
    expect(nextDrawnArea(view(150, 120, 200, 100), area)).toBe(area);
  });

  it('moves the area when panning out of any side', () => {
    const area = nextDrawnArea(view(100, 100, 200, 100), null);
    const panTo = (left, top) => nextDrawnArea(view(left, top, 200, 100), area);
    expect(panTo(-1, 100)).not.toBe(area);
    expect(panTo(201, 100)).not.toBe(area);
    expect(panTo(100, 49)).not.toBe(area);
    expect(panTo(100, 151)).not.toBe(area);
  });

  it('shrinks the area after zooming in far', () => {
    const area = nextDrawnArea(view(0, 0, 10_000, 5000), null);
    const next = nextDrawnArea(view(4000, 2000, 1000, 500), area);
    expect(next.right - next.left).toBe(2000);
  });
});

describe('nodesInArea', () => {
  const area = { left: 0, top: 0, right: 1000, bottom: 1000 };

  it('draws a node inside the area and leaves out one past its edge', () => {
    expect(nodesInArea([{ uuid: 'a', x: 100, y: 100 }], area)).toHaveLength(1);
    expect(nodesInArea([{ uuid: 'a', x: 1000, y: 100 }], area)).toHaveLength(0);
  });

  it('keeps a node outside the area when asked to', () => {
    const list = [
      { uuid: 'a', x: 5000, y: 0 },
      { uuid: 'b', x: 6000, y: 0 },
    ];
    expect(nodesInArea(list, area, 'a').map(({ uuid }) => uuid)).toEqual(['a']);
  });
});

describe('edgeArrowPath', () => {
  const coordinates = (arrow) => arrow.match(/-?\d+(\.\d+)?/g).map(Number);

  it('follows the direction of an edge pointing backwards', () => {
    const arrow = edgeArrowPath(points([100, 0], [0, 0]));
    expect(coordinates(arrow)).toEqual([0, 0, 8, -4, 8, 4]);
  });

  it('stays finite on a zero-length segment', () => {
    expect(edgeArrowPath(points([5, 5], [5, 5]))).not.toMatch(/NaN|Infinity/);
  });
});

describe('normalizeSeverity and severityRank', () => {
  it('recognizes all canonical severities regardless of case or whitespace', () => {
    expect(normalizeSeverity('critical')).toBe('CRITICAL');
    expect(normalizeSeverity(' High ')).toBe('HIGH');
    expect(normalizeSeverity('MEDIUM')).toBe('MEDIUM');
    expect(normalizeSeverity('low')).toBe('LOW');
    expect(normalizeSeverity('info')).toBe('INFO');
    expect(normalizeSeverity('UNASSIGNED')).toBe('UNASSIGNED');
  });

  it('maps missing, empty, or unknown severities to UNASSIGNED', () => {
    expect(normalizeSeverity(null)).toBe('UNASSIGNED');
    expect(normalizeSeverity(undefined)).toBe('UNASSIGNED');
    expect(normalizeSeverity('')).toBe('UNASSIGNED');
    expect(normalizeSeverity('UNKNOWN')).toBe('UNASSIGNED');
    expect(normalizeSeverity(42)).toBe('UNASSIGNED');
  });

  it('orders severities from CRITICAL down to UNASSIGNED', () => {
    const ranks = SEVERITY_ORDER.map((severity) => severityRank(severity));
    expect(ranks).toEqual([0, 1, 2, 3, 4, 5]);
    expect(severityRank('UNKNOWN')).toBe(severityRank('UNASSIGNED'));
  });
});

describe('summarizeFindingsByComponent', () => {
  const finding = (componentUuid, severity, overrides = {}) => ({
    component: { uuid: componentUuid },
    vulnerability: {
      uuid: overrides.vulnUuid ?? `v-${componentUuid}-${severity}`,
      severity,
      ...overrides.vulnerability,
    },
    analysis: overrides.analysis,
    matrix: overrides.matrix,
  });

  it('returns an empty map for missing, empty, or malformed findings', () => {
    expect(summarizeFindingsByComponent(null).size).toBe(0);
    expect(summarizeFindingsByComponent(undefined).size).toBe(0);
    expect(summarizeFindingsByComponent([]).size).toBe(0);
    expect(
      summarizeFindingsByComponent([null, {}, { component: {} }]).size,
    ).toBe(0);
  });

  it('summarizes a single vulnerability on a component', () => {
    const summaries = summarizeFindingsByComponent([finding('comp-a', 'HIGH')]);
    expect(summaries.get('comp-a')).toEqual({
      total: 1,
      highestSeverity: 'HIGH',
      counts: {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 0,
        LOW: 0,
        INFO: 0,
        UNASSIGNED: 0,
      },
    });
    expect(summaries.has('comp-clean')).toBe(false);
  });

  it('aggregates multiple vulnerabilities and picks the highest severity', () => {
    const summaries = summarizeFindingsByComponent([
      finding('comp-a', 'LOW', { vulnUuid: 'v1' }),
      finding('comp-a', 'CRITICAL', { vulnUuid: 'v2' }),
      finding('comp-a', 'MEDIUM', { vulnUuid: 'v3' }),
      finding('comp-a', 'CRITICAL', { vulnUuid: 'v4' }),
      finding('comp-b', 'INFO', { vulnUuid: 'v5' }),
    ]);

    expect(summaries.get('comp-a')).toEqual({
      total: 4,
      highestSeverity: 'CRITICAL',
      counts: {
        CRITICAL: 2,
        HIGH: 0,
        MEDIUM: 1,
        LOW: 1,
        INFO: 0,
        UNASSIGNED: 0,
      },
    });
    expect(summaries.get('comp-b').highestSeverity).toBe('INFO');
    expect(summaries.get('comp-b').total).toBe(1);
  });

  it('classifies missing or unknown severities as UNASSIGNED', () => {
    const summaries = summarizeFindingsByComponent([
      { component: { uuid: 'comp-a' }, vulnerability: { uuid: 'v1' } },
      {
        component: { uuid: 'comp-a' },
        vulnerability: { uuid: 'v2', severity: 'BOGUS' },
      },
      { component: { uuid: 'comp-b' } },
    ]);

    expect(summaries.get('comp-a').highestSeverity).toBe('UNASSIGNED');
    expect(summaries.get('comp-a').counts.UNASSIGNED).toBe(2);
    expect(summaries.get('comp-b').highestSeverity).toBe('UNASSIGNED');
    expect(summaries.get('comp-b').total).toBe(1);
  });

  it('ignores suppressed findings and keeps active non-suppressed findings', () => {
    const summaries = summarizeFindingsByComponent([
      finding('comp-a', 'CRITICAL', {
        vulnUuid: 'v1',
        analysis: { state: 'FALSE_POSITIVE', isSuppressed: true },
      }),
      finding('comp-a', 'MEDIUM', {
        vulnUuid: 'v2',
        analysis: { state: 'EXPLOITABLE', isSuppressed: false },
      }),
      finding('comp-suppressed-only', 'HIGH', {
        vulnUuid: 'v3',
        analysis: { isSuppressed: true },
      }),
    ]);

    expect(summaries.get('comp-a').total).toBe(1);
    expect(summaries.get('comp-a').highestSeverity).toBe('MEDIUM');
    expect(summaries.has('comp-suppressed-only')).toBe(false);
  });

  it('deduplicates repeated findings for the same component and vulnerability', () => {
    const summaries = summarizeFindingsByComponent([
      finding('comp-a', 'HIGH', { vulnUuid: 'v1' }),
      finding('comp-a', 'HIGH', { vulnUuid: 'v1' }),
      {
        component: { uuid: 'comp-b' },
        vulnerability: {
          source: 'NVD',
          vulnId: 'CVE-2024-0001',
          severity: 'LOW',
        },
      },
      {
        component: { uuid: 'comp-b' },
        vulnerability: {
          source: 'NVD',
          vulnId: 'CVE-2024-0001',
          severity: 'LOW',
        },
      },
      {
        component: { uuid: 'comp-c' },
        matrix: 'p1:comp-c:v9',
        vulnerability: { severity: 'MEDIUM' },
      },
      {
        component: { uuid: 'comp-c' },
        matrix: 'p1:comp-c:v9',
        vulnerability: { severity: 'MEDIUM' },
      },
    ]);

    expect(summaries.get('comp-a').total).toBe(1);
    expect(summaries.get('comp-b').total).toBe(1);
    expect(summaries.get('comp-c').total).toBe(1);
  });

  it('does not mutate input finding objects', () => {
    const raw = Object.freeze({
      component: Object.freeze({ uuid: 'comp-a' }),
      vulnerability: Object.freeze({ uuid: 'v1', severity: 'high' }),
    });
    const summaries = summarizeFindingsByComponent([raw]);
    expect(summaries.get('comp-a').highestSeverity).toBe('HIGH');
  });
});

describe('formatVulnerabilityBreakdown', () => {
  const labels = {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    INFO: 'Info',
    UNASSIGNED: 'Unassigned',
  };

  it('formats non-zero severity counts in canonical order', () => {
    const summary = {
      total: 4,
      highestSeverity: 'CRITICAL',
      counts: {
        CRITICAL: 1,
        HIGH: 0,
        MEDIUM: 2,
        LOW: 0,
        INFO: 0,
        UNASSIGNED: 1,
      },
    };
    expect(formatVulnerabilityBreakdown(summary, (s) => labels[s])).toBe(
      '1 Critical, 2 Medium, 1 Unassigned',
    );
  });

  it('returns an empty string when there are no vulnerabilities', () => {
    expect(formatVulnerabilityBreakdown(null, (s) => labels[s])).toBe('');
    expect(formatVulnerabilityBreakdown({ total: 0 }, (s) => labels[s])).toBe(
      '',
    );
  });
});

describe('formatVulnerabilityBadge', () => {
  const labels = {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    INFO: 'Info',
    UNASSIGNED: 'Unassigned',
  };
  const uniform = ({ count, severity }) => `${count} ${severity}`;
  const mixed = ({ count, severity, otherCount }) =>
    `${count} ${severity} (+${otherCount})`;

  it('formats single and uniform multi-vulnerability summaries without a mixed suffix', () => {
    expect(
      formatVulnerabilityBadge(
        { total: 1, highestSeverity: 'CRITICAL', counts: { CRITICAL: 1 } },
        (s) => labels[s],
        uniform,
        mixed,
      ),
    ).toBe('1 Critical');
    expect(
      formatVulnerabilityBadge(
        { total: 3, highestSeverity: 'CRITICAL', counts: { CRITICAL: 3 } },
        (s) => labels[s],
        uniform,
        mixed,
      ),
    ).toBe('3 Critical');
  });

  it('distinguishes highest severity count from additional lower-severity vulnerabilities', () => {
    expect(
      formatVulnerabilityBadge(
        {
          total: 3,
          highestSeverity: 'CRITICAL',
          counts: { CRITICAL: 1, MEDIUM: 1, UNASSIGNED: 1 },
        },
        (s) => labels[s],
        uniform,
        mixed,
      ),
    ).toBe('1 Critical (+2)');
    expect(
      formatVulnerabilityBadge(
        {
          total: 5,
          highestSeverity: 'HIGH',
          counts: { HIGH: 2, MEDIUM: 2, LOW: 1 },
        },
        (s) => labels[s],
        uniform,
        mixed,
      ),
    ).toBe('2 High (+3)');
  });

  it('returns an empty string for empty or missing summaries', () => {
    expect(
      formatVulnerabilityBadge(null, (s) => labels[s], uniform, mixed),
    ).toBe('');
    expect(
      formatVulnerabilityBadge({ total: 0 }, (s) => labels[s], uniform, mixed),
    ).toBe('');
  });
});

describe('visibleSeverities', () => {
  it('returns only unique highest severities of currently visible vulnerable nodes in canonical order', () => {
    const summaries = summarizeFindingsByComponent([
      {
        component: { uuid: 'visible-low' },
        vulnerability: { uuid: 'v1', severity: 'LOW' },
      },
      {
        component: { uuid: 'visible-high' },
        vulnerability: { uuid: 'v2', severity: 'HIGH' },
      },
      {
        component: { uuid: 'visible-high-2' },
        vulnerability: { uuid: 'v3', severity: 'HIGH' },
      },
      {
        component: { uuid: 'hidden-critical' },
        vulnerability: { uuid: 'v4', severity: 'CRITICAL' },
      },
    ]);

    expect(
      visibleSeverities(
        new Set(['root', 'visible-low', 'visible-high', 'visible-high-2']),
        summaries,
      ),
    ).toEqual(['HIGH', 'LOW']);
  });

  it('filters out non-component nodes when the graph node map is provided', () => {
    const summaries = summarizeFindingsByComponent([
      {
        component: { uuid: 'proj-root' },
        vulnerability: { uuid: 'v1', severity: 'CRITICAL' },
      },
      {
        component: { uuid: 'svc-1' },
        vulnerability: { uuid: 'v2', severity: 'HIGH' },
      },
      {
        component: { uuid: 'comp-1' },
        vulnerability: { uuid: 'v3', severity: 'MEDIUM' },
      },
    ]);
    const nodes = new Map([
      ['proj-root', { uuid: 'proj-root', type: 'PROJECT' }],
      ['svc-1', { uuid: 'svc-1', type: 'SERVICE' }],
      ['comp-1', { uuid: 'comp-1', type: 'COMPONENT' }],
    ]);

    expect(
      visibleSeverities(
        new Set(['proj-root', 'svc-1', 'comp-1']),
        summaries,
        nodes,
      ),
    ).toEqual(['MEDIUM']);
  });

  it('returns an empty list for empty graphs or missing vulnerability data', () => {
    expect(visibleSeverities(new Set(), new Map())).toEqual([]);
    expect(visibleSeverities(new Set(['a']), new Map())).toEqual([]);
    expect(visibleSeverities(null, null)).toEqual([]);
  });
});

describe('fetchProjectFindings', () => {
  it('fetches a single page without extra requests when total fits on one page', async () => {
    const get = vi.fn().mockResolvedValue({
      data: [{ component: { uuid: 'a' } }, { component: { uuid: 'b' } }],
      headers: { 'x-total-count': '2' },
    });

    const result = await fetchProjectFindings('/api/v1/finding/project/p1', {
      get,
      pageSize: 2,
    });

    expect(result).toEqual({
      findings: [{ component: { uuid: 'a' } }, { component: { uuid: 'b' } }],
      truncated: false,
      total: 2,
    });
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/api/v1/finding/project/p1', {
      params: { suppressed: false, pageNumber: 1, pageSize: 2 },
      signal: undefined,
    });
  });

  it('paginates through all pages when findings exceed one page', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 1 }, { id: 2 }],
        headers: new Headers({ 'X-Total-Count': '3' }),
      })
      .mockResolvedValueOnce({
        data: [{ id: 3 }],
        headers: new Headers({ 'X-Total-Count': '3' }),
      });

    const result = await fetchProjectFindings('/api/v1/finding/project/p1', {
      get,
      pageSize: 2,
    });

    expect(result).toEqual({
      findings: [{ id: 1 }, { id: 2 }, { id: 3 }],
      truncated: false,
      total: 3,
    });
    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(2, '/api/v1/finding/project/p1', {
      params: { suppressed: false, pageNumber: 2, pageSize: 2 },
      signal: undefined,
    });
  });

  it('stops on a short page even without X-Total-Count and handles non-array payloads', async () => {
    const get = vi.fn().mockResolvedValueOnce({ data: null, headers: {} });
    const result = await fetchProjectFindings('/api/v1/finding/project/p1', {
      get,
      pageSize: 100,
    });
    expect(result).toEqual({ findings: [], truncated: false, total: null });
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('handles malformed X-Total-Count headers safely and stops on a short page', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 1 }, { id: 2 }],
        headers: { 'x-total-count': 'not-a-number' },
      })
      .mockResolvedValueOnce({
        data: [{ id: 3 }],
        headers: { 'x-total-count': '-10' },
      });

    const result = await fetchProjectFindings('/api/v1/finding/project/p1', {
      get,
      pageSize: 2,
      maxPages: 5,
    });

    expect(result).toEqual({
      findings: [{ id: 1 }, { id: 2 }, { id: 3 }],
      truncated: false,
      total: null,
    });
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('rejects with AbortError when AbortSignal is aborted before or during requests', async () => {
    const preAborted = new AbortController();
    preAborted.abort();
    const get = vi.fn();
    await expect(
      fetchProjectFindings('/api/v1/finding/project/p1', {
        get,
        signal: preAborted.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(get).not.toHaveBeenCalled();

    const midFlight = new AbortController();
    const getMid = vi.fn().mockImplementation(async () => {
      midFlight.abort();
      return {
        data: [{ id: 1 }, { id: 2 }],
        headers: { 'x-total-count': '5' },
      };
    });
    await expect(
      fetchProjectFindings('/api/v1/finding/project/p1', {
        get: getMid,
        signal: midFlight.signal,
        pageSize: 2,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(getMid).toHaveBeenCalledTimes(1);
  });

  it('reports truncation when reaching maxPages while X-Total-Count indicates more findings', async () => {
    const get = vi.fn().mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
      headers: { 'x-total-count': '100' },
    });

    const result = await fetchProjectFindings('/api/v1/finding/project/p1', {
      get,
      pageSize: 2,
      maxPages: 3,
    });

    expect(result.findings).toHaveLength(6);
    expect(result.truncated).toBe(true);
    expect(result.total).toBe(100);
    expect(get).toHaveBeenCalledTimes(3);
  });

  it('does not report truncation when X-Total-Count exactly matches maxPages * pageSize', async () => {
    const get = vi.fn().mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
      headers: { 'x-total-count': '6' },
    });

    const result = await fetchProjectFindings('/api/v1/finding/project/p1', {
      get,
      pageSize: 2,
      maxPages: 3,
    });

    expect(result.findings).toHaveLength(6);
    expect(result.truncated).toBe(false);
    expect(result.total).toBe(6);
    expect(get).toHaveBeenCalledTimes(3);
  });

  it('reports truncation when reaching maxPages with full pages and missing X-Total-Count', async () => {
    const get = vi.fn().mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
      headers: {},
    });

    const result = await fetchProjectFindings('/api/v1/finding/project/p1', {
      get,
      pageSize: 2,
      maxPages: 2,
    });

    expect(result.findings).toHaveLength(4);
    expect(result.truncated).toBe(true);
    expect(result.total).toBeNull();
    expect(get).toHaveBeenCalledTimes(2);
  });
});
