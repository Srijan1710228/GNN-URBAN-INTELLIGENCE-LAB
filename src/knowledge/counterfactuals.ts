export const counterfactuals = {
  title: "Causal and Counterfactual Graph Learning",
  intuition: "Asks 'what if' questions to predict how the urban graph responds when its structure changes (e.g. severing a road or building a new expressway).",
  mathematics: "Evaluates the potential outcome Y(a) under intervention A = a:\n  G' = (V, E \\ {e_removed} ∪ {e_added})\nWe compare the predicted state distribution P(Y | do(A=a)) against the baseline distribution.",
  urbanExample: "Simulating city congestion changes when adding a bypass expressway between two residential suburbs.",
  researchImplication: "GNN counterfactual modeling moves beyond passive traffic prediction ('what is') to proactive structural design ('what if')."
};
