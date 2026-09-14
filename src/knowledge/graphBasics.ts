export const graphBasics = {
  title: "Graph Theory Foundations",
  intuition: "A graph is a mathematical abstraction representing entities (nodes) and their pairwise relationships (edges). Instead of analyzing objects in isolation, graph theory focuses on the topological structure of connections.",
  mathematics: "Formally, a graph is defined as a tuple G = (V, E) where:\n- V is a set of vertices (or nodes) representing elements.\n- E ⊆ {{u, v} | u, v ∈ V} is a set of edges representing connections.\nFor attributed graphs, we define node feature matrices X ∈ ℝ^{|V| × d_n} and edge feature matrices E_f ∈ ℝ^{|E| × d_e}.",
  urbanExample: "In urban intelligence, intersections are nodes, and road segments connecting them are edges. Attributes on nodes include average traffic queue lengths and speed ratios, while edge attributes capture road lengths, lane counts, and flow capacities.",
  researchImplication: "Modeling cities as graphs allows researchers to run network flow analysis, study percolation thresholds during road blockages, and train Graph Neural Networks to forecast congestion propagation across adjacent intersections."
};
