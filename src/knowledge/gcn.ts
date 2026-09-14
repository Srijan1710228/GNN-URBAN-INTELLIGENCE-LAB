export const gcn = {
  title: "Graph Convolutional Networks (GCN)",
  intuition: "GCN approximates spectral graph convolution on spatial domains, aggregating neighbor states using symmetric normalization based on node degrees.",
  mathematics: "GCN update rule:\n  H^{(l+1)} = σ( D̃^{-1/2} Ã D̃^{-1/2} H^{(l)} W^{(l)} )\nWhere Ã = A + I_N (adjacency matrix with self-loops) and D̃_ii = ∑ Ã_ij.",
  urbanExample: "Symmetric normalization ensures that nodes connected to massive highways aren't overwhelmed by extreme aggregated traffic vectors from high-degree neighbors.",
  researchImplication: "GCNs are highly efficient but assume isotropic message passing (all neighbors are treated equally), which limits representation on complex traffic grids."
};
