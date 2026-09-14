GNN Urban Intelligence Lab
Graph Neural Networks for Interactive Urban Intelligence, Traffic Simulation & Intervention Analysis

GNN Urban Intelligence Lab is an interactive research-oriented frontend prototype that demonstrates how a city can be represented as a graph and how Graph Neural Networks (GNNs) can be used to understand spatial relationships, traffic propagation, urban connectivity, and the potential effects of infrastructure interventions.

Instead of treating a city as a collection of independent locations, the system models it as an interconnected network:

CITY
  ↓
URBAN NETWORK
  ↓
GRAPH G = (V, E, X)
  ↓
GNN / ST-GNN
  ↓
TRAFFIC & NETWORK ANALYSIS
  ↓
INTERVENTION
  ↓
MODIFIED GRAPH G′
  ↓
SCENARIO ANALYSIS
  ↓
IMPACT + SPILLOVER + EXPLANATION

The prototype is designed as a visual research laboratory where users can explore how changes to one part of an urban network can propagate through connected regions.

Important: The current website is a frontend simulation/prototype. Its displayed GNN predictions and traffic values are illustrative/simulated and should not be interpreted as results from a trained production model.

🚀 What Does the Project Do?

The application creates an interactive miniature urban environment and allows the user to explore the relationship between:

Urban roads
Intersections
Buildings and zones
Traffic
Graph structure
GNN neighborhoods
Traffic propagation
Infrastructure capacity
Road interventions
Scenario comparison
Network-wide effects
Spillover effects
Graph algorithms
Research concepts

The central question behind the project is:

“What happens to the city when we change something in its network?”

For example:

Normal City
     ↓
Close a road
     ↓
Graph changes
     ↓
Traffic redistributes
     ↓
Neighbouring roads are affected
     ↓
2-hop / 3-hop effects appear
     ↓
Compare Before vs After
🧠 Core Research Idea

Traditional traffic prediction generally asks:

What will traffic look like in the future?

This project explores a broader question:

What could happen if we modify the urban network?

For example:

What happens if a road is closed?
What happens if road capacity is reduced?
What happens if capacity is increased?
Which neighbouring roads experience the largest impact?
How far does the effect propagate through the network?
Which nodes become more important?
How does connectivity change?
Can a GNN estimate the network-wide consequences?

This leads to the concept:

Original Urban Graph
       G
       │
       │ Intervention
       ↓
Modified Urban Graph
       G′
       │
       │ GNN / Simulation
       ↓
Scenario Prediction
       Ŷ′
       │
       ↓
Impact
       ΔŶ = Ŷ′ − Ŷ
🏙️ 1. Interactive City Environment

The main screen presents an interactive urban environment representing a simplified city.

The city contains elements such as:

Roads
Intersections
Buildings
Urban zones
Traffic
Vehicles
Road connections
Graph nodes
Graph edges

The user can navigate the environment and inspect different parts of the city.

The purpose is not to reproduce an entire real city, but to create a controlled environment in which the underlying graph-learning concepts can be visually understood.

🕸️ 2. City → Graph Representation

One of the most important concepts demonstrated by the application is:

A city can be represented as a graph.

The system represents:

Nodes

Nodes represent important urban locations such as:

Intersections
Junctions
Network locations
Urban points

Each node can contain information such as:

Node ID
Location
Degree
Traffic state
Accessibility
Connectivity
Neighbouring nodes
Edges

Edges represent relationships between nodes.

In the road-network interpretation, an edge represents a road connection.

An edge can contain information such as:

Road distance
Road capacity
Traffic flow
Speed
Congestion
Road type
Connectivity

Therefore:

Node A ───────── Node B
        Road

becomes:

G = (V, E, X)

where:

V = nodes
E = edges
X = node/edge features
🔬 3. Graph Inspection

Users can inspect individual graph components.

Selecting a node can reveal information such as:

NODE
──────────────
ID
Location
Degree
Traffic
Accessibility
Neighbours

Selecting a road/edge can reveal:

EDGE
──────────────
Road
Distance
Capacity
Speed
Traffic Flow
Congestion
Road Type

This makes the abstract graph representation visible instead of hiding it inside a machine-learning model.

🧩 4. GNN Neighborhood Explorer

The application demonstrates one of the fundamental ideas behind GNNs:

A node learns from information in its neighbourhood.

The user can explore:

1-Hop Neighborhood

Immediate neighbours.

      B
      |
A ─── X ─── C
      |
      D

X receives information from A, B, C, and D.

2-Hop Neighborhood

Information can propagate through neighbours of neighbours.

2-hop
      ○
      |
○ ─── B ─── ○
      |
      X
      |
○ ─── C ─── ○
3-Hop Neighborhood

The receptive field expands further through the graph.

This visually demonstrates why an urban intervention can affect locations that are not immediately adjacent.

🔄 5. GNN Message Passing

The application also explains the basic message-passing mechanism used by GNNs.

Conceptually:

Neighbour Features
       ↓
Message Generation
       ↓
Aggregation
       ↓
Node Update
       ↓
New Node Representation

A simplified formulation is:

$$ h_v^{(l+1)} = UPDATE \left( h_v^{(l)}, AGGREGATE \left( \{h_u^{(l)}:u\in N(v)\} \right) \right) $$

In simple terms:

A node updates its representation using information from itself and its neighbouring nodes.

The interface allows this process to be understood visually rather than only mathematically.

🚗 6. Traffic Simulation

The city contains a dynamic traffic layer.

The simulation represents:

Vehicles
Traffic flow
Road usage
Congestion
Speed
Capacity
Traffic redistribution

Traffic conditions can change across the network.

The purpose is to demonstrate an important urban-network property:

Traffic at one location depends on the state and connectivity of other locations.

📊 7. Traffic & Network Analytics

The analytics interface provides information about the current network state.

Depending on the selected component/scenario, users can inspect:

Traffic volume
Congestion
Speed
Network connectivity
Affected roads
Affected nodes
Scenario changes
Network-level effects

The analytics layer helps transform the visual simulation into measurable outputs.

🧠 8. Intervention Lab

This is one of the most important components of the project.

Instead of only observing the existing city, users can modify the urban network.

The intervention system supports scenarios such as:

Road Closure
G
↓
Remove / disable edge
↓
G′

The selected road is removed or disabled.

Capacity Reduction

For example:

Road Capacity
     ↓
-10%
-20%
-30%
-50%

This simulates infrastructure restrictions or reduced road capacity.

Capacity Increase

The system can also simulate:

+10%
+20%
+30%
+50%

representing possible infrastructure improvements.

New Road

A new connection can conceptually be introduced:

Node A ───── New Edge ───── Node B

This represents a new road/network connection.

🔀 9. G → G′ Transformation

The intervention system makes the research concept explicit.

The original graph is:

$$ G=(V,E,X) $$

After an intervention:

$$ G' = T(G,I) $$

where:

G = original graph
I = intervention
T = transformation
G′ = modified graph

For example:

Original Graph

A ─── B ─── C
     │
     D


        ↓
   Road Closure


Modified Graph

A     B ─── C
      │
      D

The application then evaluates how the network responds.

🔥 10. Impact / Heatmap Visualization

After an intervention, the system highlights affected parts of the network.

The impact layer can communicate:

Direct Effect
     ↓
Local Effect
     ↓
2-Hop Effect
     ↓
3-Hop Effect
     ↓
Distant / Network Effect

This demonstrates the concept of spatial spillover.

For example:

INTERVENTION
     ↓
Road A closed
     ↓
Traffic moves to Road B
     ↓
Road B becomes congested
     ↓
Road C receives additional traffic
     ↓
Further network redistribution

The objective is to make network-wide consequences visually understandable.

🌊 11. Spillover Analysis

A major research motivation of the project is that an intervention does not necessarily affect only the location where it occurs.

Suppose:

Road X
  ↓
Capacity reduced

The effect may propagate:

Road X
  ↓
Neighbouring Roads
  ↓
2-Hop Roads
  ↓
3-Hop Roads
  ↓
Network-wide redistribution

The project therefore treats spillover propagation as an important analytical dimension.

This is particularly relevant for urban planning because a locally beneficial intervention can sometimes create unintended consequences elsewhere.

⚖️ 12. Before vs After Scenario Comparison

The application allows a baseline scenario to be compared against an intervention scenario.

Baseline
Original City
G
Intervention
Modified City
G′

The system compares quantities such as:

Traffic
Congestion
Speed
Network impact
Affected roads
Affected nodes

Conceptually:

$$ \Delta Y = Y_{intervention}-Y_{baseline} $$

This makes the system a scenario-analysis tool rather than simply a traffic visualizer.

📈 13. Scenario Lab

Multiple urban scenarios can be examined and compared.

For example:

Scenario	Intervention	Expected Purpose
Baseline	None	Reference condition
Scenario A	Road Closure	Study disruption
Scenario B	-20% Capacity	Study restriction
Scenario C	-50% Capacity	Study severe restriction
Scenario D	+20% Capacity	Study improvement
Scenario E	New Connection	Study network expansion

This creates an experimental environment for urban intervention research.

🧮 14. Simulation Engine

The frontend contains simulation-oriented modules responsible for generating and updating the virtual city.

The project includes components for:

City generation
Road generation
Building generation
Zone generation
Graph construction
Traffic simulation
Vehicle simulation
Routing
Signal behavior
Scenario execution
Scenario comparison
Metrics

This creates a self-contained environment for demonstrating the research concept without requiring a backend.

🧠 15. Intervention-Aware GNN Engine

The prototype also contains an intervention-oriented GNN simulation layer.

The intended research pipeline is:

Urban Graph G
     ↓
Baseline State
     ↓
GNN
     ↓
Baseline Prediction
     ↓
Intervention I
     ↓
Modified Graph G′
     ↓
GNN
     ↓
Scenario Prediction
     ↓
Compare
     ↓
ΔY

The key idea is to make the intervention part of the graph-learning problem rather than simply forecasting the next traffic value.

🔍 16. Research Layer

The application contains a dedicated research-oriented layer explaining concepts related to:

Graph Neural Networks
Graph basics
Graph types
GCN
GAT
GraphSAGE
GIN
Temporal GNNs
Heterogeneous GNNs
Urban GNNs
Graph algorithms
Counterfactual learning
Urban planning
Research methodology

This turns the website into more than a simulation.

It acts as an interactive learning and research laboratory.

📚 17. Built-in GNN Knowledge Base

The application includes structured knowledge covering important GNN concepts.

Topics include:

Graph Fundamentals
Nodes
Edges
Degree
Connectivity
Graph structure
GNN Architectures
GCN
GAT
GraphSAGE
GIN
Advanced GNN Concepts
Temporal GNNs
Heterogeneous GNNs
Urban GNNs
Counterfactual learning
Urban Planning
Transportation networks
Urban connectivity
Intervention analysis
Network effects

This allows the interface to function as a visual research companion.

🤖 18. Research Assistant

The project includes a research-assistant interface designed around the GNN and urban-intelligence knowledge embedded in the application.

The assistant can conceptually help users explore questions such as:

What is a GNN?
        ↓
How does GAT work?
        ↓
What is a 2-hop neighborhood?
        ↓
What happens after a road closure?
        ↓
What is counterfactual analysis?
        ↓
Why can an intervention cause spillover?

The goal is to connect the theory layer with the simulation layer.

🧬 19. Counterfactual Urban Analysis

The research direction is based around the idea of asking:

“What would happen if the city were different?”

Instead of only observing:

G → Y

we examine:

G → Y

versus

G′ → Y′

where:

G′ = modified city graph

and:

ΔY = Y′ − Y

This creates a foundation for studying urban interventions.

Important scientific distinction

The prototype does not automatically establish causal effects.

A GNN producing a different prediction after graph modification does not by itself prove causality.

Therefore the current system should be described as:

scenario analysis / counterfactual estimation under modelling assumptions

rather than claiming validated causal inference.

🗺️ 20. Urban Graph + Geographic Visualization

The broader research architecture is designed to connect geographic space with graph space.

Conceptually:

             REAL / SIMULATED CITY
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
    Geographic Space         Graph Space
          │                       │
       Roads                    Nodes
       Places                   Edges
       Zones                    Features
          │                       │
          └───────────┬───────────┘
                      ↓
                    GNN
                      ↓
               Urban Analysis

The purpose is to maintain a direct relationship between:

Where something is physically located

and

How it is represented mathematically in the graph.

🧭 21. Inspector / Information Panel

The inspector provides contextual information about selected elements.

A user can select an urban component and inspect its properties rather than simply seeing it visually.

This is particularly useful for understanding:

Physical object
      ↕
Graph representation
      ↕
GNN representation
      ↕
Simulation state
🧪 22. Research Experiment Workflow

The application is designed around an experimental workflow:

1. Generate / Load City
          ↓
2. Construct Graph
          ↓
3. Inspect Network
          ↓
4. Observe Traffic
          ↓
5. Select Node / Edge
          ↓
6. Inspect GNN Neighborhood
          ↓
7. Apply Intervention
          ↓
8. Create Modified Graph
          ↓
9. Run Scenario
          ↓
10. Observe Traffic Redistribution
          ↓
11. Analyze Spillover
          ↓
12. Compare Baseline vs Scenario

This workflow mirrors the intended research methodology.

🧩 23. Graph Algorithms

The project also contains graph-algorithm functionality supporting the urban network representation.

This provides the foundation for analysing properties such as:

Connectivity
Neighbourhoods
Paths
Network structure
Graph relationships

This is particularly relevant because the proposed research direction has a strong graph-theoretic component.

🎯 Research Objective

The long-term research objective behind the prototype is:

“To develop and experimentally evaluate an intervention-aware dynamic graph-learning framework that estimates the network-wide consequences of urban infrastructure interventions, with particular emphasis on direct effects, spatial spillovers, temporal responses, generalization to unseen scenarios, uncertainty estimation, and explainability.”

The current website should therefore be viewed as a research prototype and experimental interface, not the final trained research system.

🔬 Proposed Research Pipeline

The overall research architecture can be summarized as:

             URBAN DATA
                 │
                 ↓
          GRAPH CONSTRUCTION
                 │
                 ↓
              GRAPH G
                 │
                 ↓
           GNN / ST-GNN
                 │
                 ↓
        BASELINE PREDICTION
                 │
                 ↓
           INTERVENTION I
                 │
                 ↓
       GRAPH TRANSFORMATION
                 │
                 ↓
             GRAPH G′
                 │
                 ↓
        SCENARIO PREDICTION
                 │
                 ↓
             ΔY = Y′ − Y
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
   Spillover  Explain.  Uncertainty
       │         │         │
       └─────────┼─────────┘
                 ↓
          DECISION SUPPORT
🧠 Why GNNs?

Urban systems are inherently relational.

If one road changes, the consequences depend on:

Neighbouring roads
Connectivity
Road capacity
Traffic conditions
Travel demand
Network structure
Temporal conditions

A conventional model treating each location independently may fail to explicitly represent these relationships.

GNNs are particularly suitable because they learn from the structure and neighbourhood relationships of graphs.

🔮 Future Research Extensions

The current prototype focuses primarily on urban road-network intervention analysis.

The framework can later be extended to:

🚇 Public Transportation
Metro stations
Bus networks
Transit demand
Intermodal connectivity
🏥 Urban Facilities
Hospitals
Schools
Emergency facilities
Service accessibility
🏗️ Land Use
Residential
Commercial
Industrial
Mixed-use development
🌱 Environment
Air pollution
Carbon emissions
Energy consumption
🚨 Resilience
Infrastructure failures
Emergency accessibility
Disaster scenarios
Network vulnerability
🏙️ Urban Planning
New roads
Road closures
Capacity changes
New transit infrastructure
Facility placement
Land-use changes
⚠️ Prototype vs Research Model

It is important to distinguish the current implementation from the eventual research system.

Current Prototype	Future Research System
Frontend simulation	Real urban datasets
Simulated traffic	Real traffic observations
Demonstration GNN logic	Trained GNN/ST-GNN
Illustrative predictions	Experimentally validated predictions
Controlled interventions	Real/simulated intervention datasets
Visual spillover	Quantitative spillover evaluation
Demonstration uncertainty	Calibrated uncertainty
Interactive scenarios	Systematic experiments

Therefore:

The website demonstrates the research concept; it does not claim that the current simulated outputs are experimentally validated predictions.

🛠️ Technology Stack
Frontend
React
TypeScript
Vite
CSS
Simulation
TypeScript-based urban simulation
Graph generation
Traffic simulation
Vehicle simulation
Routing
Scenario engine
Intervention engine
Graph / AI Concepts
GNN
GCN
GAT
GraphSAGE
GIN
Temporal GNN
Heterogeneous GNN
Counterfactual graph learning
Development
Git
GitHub
Vercel
📁 Project Structure
GNN-URBAN-INTELLIGENCE-LAB/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── Analytics.tsx
│   │   ├── CityCanvas.tsx
│   │   ├── GnnLab.tsx
│   │   ├── Inspector.tsx
│   │   ├── InterventionLab.tsx
│   │   ├── ResearchAssistant.tsx
│   │   ├── ResearchLayer.tsx
│   │   ├── ScenarioLab.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── UIComponents.tsx
│   │
│   ├── context/
│   │   └── AppContext.tsx
│   │
│   ├── knowledge/
│   │   ├── counterfactuals.ts
│   │   ├── gat.ts
│   │   ├── gcn.ts
│   │   ├── gin.ts
│   │   ├── gnnBasics.ts
│   │   ├── graphAlgorithms.ts
│   │   ├── graphBasics.ts
│   │   ├── graphSage.ts
│   │   ├── graphTypes.ts
│   │   ├── heterogeneousGnn.ts
│   │   ├── researchMethodology.ts
│   │   ├── temporalGnn.ts
│   │   ├── urbanGnn.ts
│   │   └── urbanPlanning.ts
│   │
│   ├── simulation/
│   │   ├── baselineManager.ts
│   │   ├── buildingGenerator.ts
│   │   ├── cityGenerator.ts
│   │   ├── graph.ts
│   │   ├── graphAlgorithms.ts
│   │   ├── graphBuilder.ts
│   │   ├── interventionGnnEngine.ts
│   │   ├── metrics.ts
│   │   ├── roadGenerator.ts
│   │   ├── routing.ts
│   │   ├── scenarioComparison.ts
│   │   ├── scenarioEngine.ts
│   │   ├── simulationEngine.ts
│   │   ├── trafficEngine.ts
│   │   ├── vehicleEngine.ts
│   │   └── zoneGenerator.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
▶️ Running the Project

Clone the repository:

git clone https://github.com/Srijan1710228/GNN-URBAN-INTELLIGENCE-LAB.git

Enter the project:

cd GNN-URBAN-INTELLIGENCE-LAB

Install dependencies:

npm install

Start the development server:

npm run dev

The application will then be available through the local development URL provided by Vite.

🧪 Current Status

Project Stage: Interactive Research Prototype

Currently demonstrated
✅ Interactive urban environment
✅ Urban graph representation
✅ Nodes and edges
✅ Graph inspection
✅ GNN neighborhood exploration
✅ GNN concepts
✅ Traffic simulation
✅ Intervention scenarios
✅ Road capacity changes
✅ Road closure scenarios
✅ Scenario comparison
✅ Spillover visualization
✅ Research knowledge layer
✅ Counterfactual concept
✅ Graph algorithms
✅ Research assistant interface
Research development still required
⏳ Real-world urban datasets
⏳ Real traffic data
⏳ Trained GNN/ST-GNN models
⏳ Systematic intervention dataset
⏳ Quantitative experimental evaluation
⏳ OOD/unseen-intervention experiments
⏳ Calibrated uncertainty
⏳ Formal explainability evaluation
⏳ Causal validation
🎓 Research Context

The project is motivated by research in:

Graph Neural Networks
Spatio-Temporal Graph Neural Networks
Urban Computing
Traffic Forecasting
GeoAI
Counterfactual Learning
Urban Network Analysis
Urban Planning
Infrastructure Intervention Analysis

The ultimate research direction is to move:

Traffic Prediction
        ↓
Urban Graph Learning
        ↓
Intervention-Aware Prediction
        ↓
Spillover Analysis
        ↓
Counterfactual Scenario Evaluation
        ↓
Trustworthy Urban Decision Support
👨‍💻 Author

Srijan Prakash

B.Tech — Computer Science & Engineering (AI & ML)

SRM Institute of Science and Technology

📌 Vision

The long-term vision of GNN Urban Intelligence Lab is to create an interactive platform where urban planners and researchers can move beyond asking:

“What is happening in the city?”

and

“What will happen next?”

to asking:

“What happens if we change the city?”

The ultimate goal is to connect:

Urban Data → Graphs → GNNs → Simulation → Interventions → Counterfactual Scenarios → Explainable Decision Support