export const graphAlgorithms = {
  title: "Graph Traversal and Pathfinding",
  intuition: "Algorithms resolve pathfinding and structural queries. Dijkstra's algorithm solves for the shortest route, while centrality indexes quantify a node's topological importance.",
  mathematics: "Dijkstra: Finds min ∑ w(e) from source s to destination d. Centrality values:\n- Degree Centrality: C_D(v) = deg(v) / (|V| - 1)\n- Closeness Centrality: C_C(v) = (|V| - 1) / ∑ d(v, u) for all u ≠ v.",
  urbanExample: "Dijkstra determines origin-to-destination vehicle trip paths. Nodes with high closeness centrality function as major traffic hubs; editing these links causes widespread network rerouting.",
  researchImplication: "Comparing pre- and post-intervention centrality matrices reveals structural vulnerabilities in urban mobility grids."
};
