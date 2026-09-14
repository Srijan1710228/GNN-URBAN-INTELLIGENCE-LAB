export const gnnBasics = {
  title: "Graph Neural Networks Overview",
  intuition: "GNNs generalise deep learning models to non-Euclidean graph topologies, passing messages between adjacent nodes to capture neighborhood structure.",
  mathematics: "GNN layer update rule:\n  h_i^{(l+1)} = UPDATE(h_i^{(l)}, AGGREGATE(h_j^{(l)}, j ∈ N(i)))\nWhere h_i^{(l)} is the vector embedding of vertex i at layer l.",
  urbanExample: "Neighborhood features (density, queue lengths, speeds) flow along roads to adjacent nodes, modeling how localized traffic build-ups spread outward.",
  researchImplication: "GNNs outperform standard neural networks on spatial structures because they enforce topological constraints directly in their neural layers."
};
