export const graphSage = {
  title: "GraphSAGE Representation Learning",
  intuition: "GraphSAGE learns inductive embeddings by sampling a fixed-size neighborhood instead of aggregating all neighbors, supporting large-scale dynamic graphs.",
  mathematics: "Neighborhood aggregation:\n  h_{N(i)}^{(l+1)} = AGGREGATE({h_j^{(l)}, ∀ j ∈ N(i)})\nEmbedding update:\n  h_i^{(l+1)} = σ( W^{(l)} · CONCAT(h_i^{(l)}, h_{N(i)}^{(l+1)}) )",
  urbanExample: "If a city has millions of intersections, GraphSAGE samples a small subset of roads (e.g. 5 neighbors) to make real-time traffic predictions computationally feasible.",
  researchImplication: "GraphSAGE supports inductive learning, meaning the model can make predictions on newly constructed roads without retraining from scratch."
};
