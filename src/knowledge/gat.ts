export const gat = {
  title: "Graph Attention Networks (GAT)",
  intuition: "GAT uses self-attention mechanisms to assign different importances (weights) to different neighbors dynamically, matching real-world traffic dependencies.",
  mathematics: "Attention coefficient between node i and j:\n  α_ij = exp(LeakyReLU(a^T [Wh_i || Wh_j])) / ∑_{k ∈ N(i)} exp(LeakyReLU(a^T [Wh_i || Wh_k]))\nWhere a^T is an attention parameter vector.",
  urbanExample: "Instead of treating residential local streets and expressways identically, GAT assigns high attention weights to the congested arterial corridor leading into the center node.",
  researchImplication: "GAT models are highly interpretable since attention weights reveal which intersections are major spatial bottle-necks."
};
