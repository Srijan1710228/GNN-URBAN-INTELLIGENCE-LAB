export const graphTypes = {
  title: "Graph Taxonomy and Types",
  intuition: "Graphs are classified based on the nature of their edges (directed vs undirected), weights, attributes, and temporal dynamic properties.",
  mathematics: "- Undirected Graph: Edges have no orientation: (u, v) ∈ E ⇔ (v, u) ∈ E.\n- Directed Graph (DiGraph): Edges represent one-way relationships: (u, v) ∈ E does not imply (v, u) ∈ E.\n- Attributed Graph: Nodes and edges possess feature vectors X_v and X_e.\n- Temporal/Dynamic Graph: Graph structure changes over time, represented as a series G_t = (V_t, E_t).",
  urbanExample: "Road networks are directed multigraphs because roads can be one-way (directed) and there can be multiple distinct routes between two intersections (multigraphs). Active traffic is temporal as flow values change dynamically.",
  researchImplication: "Choosing the correct graph type determines GNN selection. Static GCNs fail on dynamic one-way systems, which require Spatio-Temporal Directed GNN models."
};
