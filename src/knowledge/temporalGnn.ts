export const temporalGnn = {
  title: "Temporal and Spatio-Temporal GNNs",
  intuition: "Combines spatial GNN layers with sequential architectures (such as GRU, LSTM, or temporal convolutions) to capture time-varying network dynamics.",
  mathematics: "ST-GCN architectures typically stack spatial graph convolutions and temporal convolutions:\n  H_{S} = GCN(X), H_{T} = Conv1D(H_{S})\nModeling both spatial graph patterns and temporal autocorrelation.",
  urbanExample: "Forecasts how a traffic jam at intersection A at 08:00 propagates to neighboring intersections B and C by 08:15.",
  researchImplication: "Spatio-Temporal models are the state of the art in traffic forecasting, energy grid load modeling, and transit queue prediction."
};
