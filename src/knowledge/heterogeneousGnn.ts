export const heterogeneousGnn = {
  title: "Heterogeneous Graph Neural Networks",
  intuition: "Processes graphs that contain multiple types of nodes (e.g. intersections, subway stations, buildings) and multiple types of edges (e.g. streets, transit lines).",
  mathematics: "Metapath-based aggregation:\n  h_i^{Φ} = AGGREGATE_{P ∈ Φ} ( h_i^{P} )\nWhere Φ represents a set of metapaths (e.g. Node-Road-Node or Node-Transit-Node).",
  urbanExample: "A multimodal mobility network containing road intersections, bus routes, rail lines, and commuter zoning attributes.",
  researchImplication: "Crucial for multi-modal city planning, heterogeneous GNNs capture complex relationships between zoning policies and traffic flows."
};
