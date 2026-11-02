import { describe, expect, it } from 'vitest';
import {
  collectReachable,
  collectVisibleEdges,
  collectVisibleNodes,
  edgeArrowPath,
  expansionToggleLabel,
  findNodesOnPaths,
  findShortestPath,
  nextDrawnArea,
  nodesInArea,
  searchNodes,
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

  it('matches the displayed label and a version', () => {
    expect(search('org.core/zeta')).toEqual(['1']);
    expect(search('2.5')).toEqual(['1']);
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
