export const gin = {
  title: "Graph Isomorphism Network (GIN)",
  intuition: "GIN is designed to be as expressive as the 1-WL isomorphism test, allowing the network to distinguish different graph topologies that GCN/GraphSAGE fail to separate.",
  mathematics: "GIN update rule:\n  h_i^{(l+1)} = MLP^{(l)} ( (1 + ε^{(l)}) h_i^{(l)} + ∑_{j ∈ N(i)} h_j^{(l)} )\nWhere ε is a learnable parameter and MLP represents a Multi-Layer Perceptron.",
  urbanExample: "Distinguishes symmetric ring road configurations from radial network trees, which is critical when analyzing travel route redundancies.",
  researchImplication: "GIN represents the upper bound of structural expressiveness for message-passing GNNs, making it suitable for rigorous topological classification."
};
