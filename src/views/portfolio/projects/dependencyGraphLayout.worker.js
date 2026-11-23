import { graphlib, layout } from '@dagrejs/dagre';
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  edgeArrowPath,
  edgeLinePath,
} from './dependencyGraph';

onmessage = ({ data: { nodes, edges } }) => {
  const graph = new graphlib.Graph();
  graph.setGraph({ rankdir: 'LR', nodesep: 16, ranksep: 72, edgesep: 8 });
  graph.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((uuid) =>
    graph.setNode(uuid, { width: NODE_WIDTH, height: NODE_HEIGHT }),
  );
  // Dagre stacks siblings in reverse order of their edges.
  edges.toReversed().forEach(([from, to]) => graph.setEdge(from, to));
  layout(graph);

  postMessage({
    width: graph.graph().width,
    height: graph.graph().height,
    nodes: nodes.map((uuid) => {
      const { x, y } = graph.node(uuid);
      return { uuid, x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 };
    }),
    edges: edges.map(([from, to]) => {
      const { points } = graph.edge(from, to);
      return {
        from,
        to,
        path: edgeLinePath(points),
        arrow: edgeArrowPath(points),
      };
    }),
  });
};
