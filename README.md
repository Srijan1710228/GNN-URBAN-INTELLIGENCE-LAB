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

One important change I recommend

Don't leave the GitHub README as just:

# GNN-URBAN-INTELLIGENCE-LAB

The README above makes the repository look like an actual research project, rather than simply a frontend assignment.

And because your repository is now connected, after replacing the README you can push the updated version with:

git add README.md
git commit -m "Add detailed project documentation"
git push

That will update the GitHub page you showed me.

how to put this readme directly copy paste?

Yes. The easiest way is to replace your existing README.md with the full text.

Option 1 — Directly through Antigravity

In Antigravity's file explorer:

Open your project:
gnn project simu
Find:
README.md
Open README.md
Press Ctrl + A
Delete everything.
Copy the README I gave you above.
Paste it into the file.
Press Ctrl + S.

That's it locally.

Then push it to GitHub

Open the Antigravity terminal and run:

git add README.md
git commit -m "Add detailed project documentation"
git push

Then refresh your GitHub repository. The README will automatically appear on the repository homepage.

⚠️ One thing

If you want the entire README in one single copy-paste block, I can give you a clean version like:

# GNN Urban Intelligence Lab

...

with no explanations outside it, so you can simply:

Ctrl+A → Ctrl+C → paste into README.md → Ctrl+S → git push.

If you want that, say “give me the copy-paste README”.

GIVE ME COPY PASTE README
# GNN Urban Intelligence Lab

### Graph Neural Networks for Interactive Urban Intelligence, Traffic Simulation & Intervention Analysis

GNN Urban Intelligence Lab is an interactive, research-oriented frontend prototype that demonstrates how an urban environment can be represented as a **graph** and how **Graph Neural Networks (GNNs)** can be used to understand spatial relationships, traffic propagation, urban connectivity, and the potential effects of infrastructure interventions.

Instead of treating a city as a collection of independent locations, this project models the city as an interconnected network:

```text
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
  ↓
DECISION SUPPORT

Important: The current implementation is a frontend simulation/research prototype. The displayed traffic values, GNN outputs, predictions, and scenario effects are illustrative/simulated and should not be interpreted as experimentally validated predictions from a trained production model.

🚀 Project Overview

The central idea of the project is to move beyond conventional traffic forecasting and explore a more important urban-planning question:

"What happens to the city when we change something in its network?"

For example:

What happens if a road is closed?
What happens if road capacity is reduced?
What happens if road capacity is increased?
Which neighbouring roads are affected?
How far does the effect propagate?
How does traffic redistribute?
Which parts of the network experience spillover?
Can a GNN estimate the network-wide consequences of an intervention?
Can different intervention scenarios be compared?

The project therefore connects:

Urban Environment → Graph Representation → GNN → Simulation → Intervention → Scenario Analysis → Spillover → Explanation

🧠 Core Research Idea

Traditional traffic forecasting primarily asks:

"What will traffic look like in the future?"

This project explores a broader question:

"What could happen if we modify the urban network?"

The underlying research formulation is:

Original Urban Graph
        G
        │
        │
   Intervention I
        │
        ↓
Modified Urban Graph
        G′
        │
        ↓
GNN / Simulation
        │
        ↓
Scenario Prediction
        │
        ↓
Network Impact
        │
        ↓
ΔY = Y′ − Y

Where:

G = original urban graph
I = intervention
G′ = modified urban graph
Y = baseline outcome
Y′ = intervention scenario outcome
ΔY = estimated change

The long-term research direction is to investigate intervention-aware dynamic graph learning, particularly for:

Direct effects
Spatial spillovers
Temporal responses
Unseen intervention scenarios
Uncertainty estimation
Explainability
Network-wide consequences
🏙️ Interactive Urban Environment

The main interface presents an interactive miniature urban environment.

The environment contains:

Roads
Intersections
Buildings
Urban zones
Traffic
Vehicles
Graph nodes
Graph edges
Network connections

The city is intentionally kept at a manageable scale so that the user can understand the relationship between the physical environment and its graph representation.

The purpose is not to reproduce an entire real city but to provide a controlled environment for demonstrating urban graph-learning concepts.

🕸️ City → Graph Representation

One of the fundamental concepts demonstrated by the application is:

A city can be represented as a graph.

The urban environment is transformed into a mathematical network.

Nodes

Nodes represent important locations in the urban network, such as:

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

Each edge can contain information such as:

Road name
Distance
Capacity
Speed
Traffic flow
Congestion
Road type
Connectivity

The resulting graph can be represented as:

G = (V, E, X)

Where:

V = nodes
E = edges
X = node and edge features
🔍 Graph Inspector

The application allows users to inspect individual components of the urban graph.

Selecting a node can display information such as:

NODE
────────────────────
Node ID
Location
Degree
Traffic
Accessibility
Connectivity
Neighbours

Selecting a road/edge can display:

EDGE
────────────────────
Road
Distance
Capacity
Speed
Traffic Flow
Congestion
Road Type

This creates a direct connection between:

Physical Urban Object
        ↕
Graph Representation
        ↕
Simulation State
        ↕
GNN Representation
🧩 GNN Neighborhood Explorer

The project demonstrates one of the fundamental principles of Graph Neural Networks:

A node learns from information in its neighbourhood.

The interface allows users to explore different graph neighbourhoods.

1-Hop Neighborhood

The immediate neighbours of a selected node.

      B
      |
A ─── X ─── C
      |
      D

Node X receives information from its directly connected neighbours.

2-Hop Neighborhood

The receptive field expands to neighbours of neighbours.

Neighbour
    ↓
  Node B
    ↓
  Target X
    ↓
  Node C
    ↓
Neighbour
3-Hop Neighborhood

The receptive field expands further through the graph.

This demonstrates why an urban intervention can potentially influence locations that are not directly adjacent to the intervention.

🔄 GNN Message Passing

The project visually demonstrates the basic idea behind GNN message passing.

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

hᵥ⁽ˡ⁺¹⁾ =
UPDATE(
    hᵥ⁽ˡ⁾,
    AGGREGATE(
        {hᵤ⁽ˡ⁾ : u ∈ N(v)}
    )
)

In simple terms:

A node updates its representation using information from itself and its neighbouring nodes.

The purpose of this interface is to make the abstract GNN mechanism visually understandable.

🚗 Traffic Simulation

The application includes a dynamic traffic simulation layer.

The simulation represents:

Vehicles
Traffic flow
Road usage
Congestion
Speed
Road capacity
Traffic redistribution
Network movement

Traffic conditions can change across the urban network.

This demonstrates a key property of urban transportation systems:

Traffic at one location can depend on the state and connectivity of other locations.

📊 Analytics

The Analytics layer provides information about the current network and scenario state.

Depending on the selected scenario, users can inspect:

Traffic volume
Congestion
Speed
Network connectivity
Affected roads
Affected nodes
Scenario changes
Network-level effects

The analytics layer converts the visual simulation into measurable quantities.

🧠 Intervention Lab

The Intervention Lab is one of the core components of the project.

Instead of simply observing the city, users can modify the urban network and study its response.

The current intervention concepts include:

🚧 Road Closure

A selected road can be closed or disabled.

Conceptually:

G
↓
Remove / Disable Edge
↓
G′

This allows the user to study how traffic redistributes through the remaining network.

📉 Capacity Reduction

Road capacity can be reduced using different intervention levels:

-10%
-20%
-30%
-50%

This represents scenarios such as:

Partial road restriction
Construction
Lane reduction
Temporary infrastructure constraints
Reduced road availability
📈 Capacity Increase

The system can also simulate increased capacity:

+10%
+20%
+30%
+50%

This represents potential infrastructure improvements.

🛣️ New Road Connection

A new connection can conceptually be introduced between network nodes.

Node A ───── New Edge ───── Node B

This represents an urban network expansion scenario.

🔀 Graph Transformation: G → G′

The intervention system makes the graph transformation explicit.

The original graph is:

G = (V, E, X)

After an intervention:

G′ = T(G, I)

Where:

G = original graph
I = intervention
T = graph transformation
G′ = modified graph

Example:

ORIGINAL GRAPH

A ─── B ─── C
     │
     D


       ↓
   ROAD CLOSURE


MODIFIED GRAPH

A     B ─── C
      │
      D

The system can then evaluate the resulting scenario.

🌊 Spillover Analysis

A major research motivation of this project is spatial spillover.

An intervention may not only affect the road where it occurs.

For example:

Road A
  ↓
Capacity reduced
  ↓
Traffic redistribution
  ↓
Road B affected
  ↓
Road C affected
  ↓
Further network propagation

The application visualizes different levels of influence:

Direct Effect
      ↓
Local Effect
      ↓
2-Hop Effect
      ↓
3-Hop Effect
      ↓
Distant / Network Effect

This allows users to explore how a local infrastructure change can produce network-wide consequences.

🔥 Impact Visualization

After an intervention is applied, the affected portion of the network can be highlighted.

The impact visualization helps answer:

Which roads changed?
Which nodes changed?
How strong is the effect?
How far did the effect propagate?
Which neighbouring regions experienced spillover?

The purpose is to transform an abstract numerical prediction into an interpretable spatial representation.

⚖️ Before vs After Scenario Comparison

The Scenario Lab compares the baseline urban network against an intervention scenario.

Baseline
Original City
     G
Intervention
Modified City
     G′

The application can compare quantities such as:

Traffic
Congestion
Speed
Affected roads
Affected nodes
Network impact

Conceptually:

ΔY = Y_intervention − Y_baseline

This allows the user to understand the difference produced by an intervention.

📈 Scenario Lab

Multiple intervention scenarios can be explored and compared.

Example scenarios:

Scenario	Intervention	Purpose
Baseline	None	Reference condition
Scenario A	Road Closure	Study disruption
Scenario B	-20% Capacity	Study restriction
Scenario C	-50% Capacity	Study severe restriction
Scenario D	+20% Capacity	Study improvement
Scenario E	New Road	Study network expansion

The scenario framework provides a controlled environment for experimentation.

🧮 Simulation Architecture

The frontend contains simulation modules responsible for generating and updating the virtual city.

The system includes components for:

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
Intervention modelling
Scenario comparison
Metrics

This creates a self-contained environment for demonstrating urban network behaviour.

🧠 Intervention-Aware GNN Engine

The project includes an intervention-oriented GNN simulation layer.

The intended research pipeline is:

Urban Graph G
      ↓
Baseline State
      ↓
GNN / Graph Model
      ↓
Baseline Prediction
      ↓
Intervention I
      ↓
Graph Transformation
      ↓
Modified Graph G′
      ↓
GNN / Graph Model
      ↓
Scenario Prediction
      ↓
Compare
      ↓
ΔY

The key research idea is to explicitly represent an intervention as a modification to the graph.

This differs from treating the problem purely as conventional traffic forecasting.

🔬 Research Layer

The application contains a dedicated research and educational layer covering important concepts related to Graph Neural Networks and urban intelligence.

Topics include:

Graph Basics
Graph Types
Graph Algorithms
Graph Neural Networks
GCN
GAT
GraphSAGE
GIN
Temporal GNNs
Heterogeneous GNNs
Urban GNNs
Counterfactual Learning
Urban Planning
Research Methodology

The objective is to connect theoretical concepts with the interactive urban simulation.

📚 Built-in GNN Knowledge Base

The project includes structured knowledge modules for important GNN concepts.

Graph Fundamentals
Nodes
Edges
Degree
Connectivity
Neighbourhoods
Graph structure
GNN Architectures
GCN
GAT
GraphSAGE
GIN
Advanced Concepts
Temporal GNNs
Heterogeneous GNNs
Urban GNNs
Counterfactual Graph Learning
Urban Intelligence
Transportation networks
Urban connectivity
Infrastructure interventions
Network effects
Urban planning
🤖 Research Assistant

The Research Assistant provides an interface for exploring the knowledge embedded in the project.

Example questions include:

What is a GNN?
How does GCN work?
How does GAT work?
What is a 2-hop neighborhood?
What is message passing?
What is a temporal GNN?
What is a heterogeneous GNN?
What is counterfactual learning?
Why can road interventions create spillover?

The purpose is to connect the theoretical research layer with the simulation environment.

🧬 Counterfactual Urban Analysis

The long-term research direction is motivated by the concept of asking:

"What would happen if the city were different?"

Instead of only analysing:

G → Y

we compare:

G  → Y

with:

G′ → Y′

where:

G′ = Modified Urban Graph

and:

ΔY = Y′ − Y

This provides the mathematical foundation for intervention and scenario analysis.

Scientific Caution

The current prototype does not establish causal effects.

A GNN predicting a different outcome after a graph modification does not automatically prove causality.

Therefore, the current system should be interpreted as:

Scenario analysis / counterfactual estimation under modelling assumptions

rather than as a validated causal inference system.

🗺️ Geographic + Graph Space

The project is designed around the connection between physical urban space and mathematical graph space.

                 CITY
                  │
          ┌───────┴───────┐
          ↓               ↓
   Geographic Space   Graph Space
          │               │
        Roads            Nodes
        Places           Edges
        Zones            Features
          │               │
          └───────┬───────┘
                  ↓
                 GNN
                  ↓
           Urban Analysis

The goal is to maintain a direct relationship between:

Where something exists physically

and

How it is represented mathematically.

🧭 Inspector System

The Inspector provides contextual information about selected components.

Users can inspect:

Urban objects
Graph nodes
Graph edges
Traffic state
Network properties
Intervention state

This helps users understand the relationship between the visual simulation and the underlying graph representation.

🧪 Research Experiment Workflow

The complete prototype workflow is:

1. Generate / Load City
            ↓
2. Construct Urban Graph
            ↓
3. Inspect Network
            ↓
4. Observe Traffic
            ↓
5. Select Node / Edge
            ↓
6. Explore GNN Neighborhood
            ↓
7. Apply Intervention
            ↓
8. Create Modified Graph
            ↓
9. Run Scenario
            ↓
10. Observe Traffic Redistribution
            ↓
11. Analyse Spillover
            ↓
12. Compare Baseline vs Scenario

This workflow mirrors the intended research methodology.

🧩 Graph Algorithms

The simulation includes graph-oriented functionality supporting the urban network representation.

Graph algorithms provide the foundation for analysing:

Connectivity
Neighbourhoods
Paths
Network structure
Graph relationships

This is important because the research direction combines Graph Neural Networks with graph-theoretic representations of urban systems.

🎯 Research Objective

The long-term research objective behind the prototype is:

"To develop and experimentally evaluate an intervention-aware dynamic graph-learning framework that estimates the network-wide consequences of urban infrastructure interventions, with particular emphasis on direct effects, spatial spillovers, temporal responses, generalization to unseen scenarios, uncertainty estimation, and explainability."

The current website serves as the interactive conceptual and experimental prototype for this research direction.

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
          ┌──────────┼──────────┐
          ↓          ↓          ↓
      Spillover  Explainability  Uncertainty
          │          │          │
          └──────────┼──────────┘
                     ↓
              DECISION SUPPORT
🧠 Why Graph Neural Networks?

Urban systems are inherently relational.

If one road changes, the resulting effects can depend on:

Neighbouring roads
Road connectivity
Road capacity
Traffic conditions
Travel demand
Network topology
Temporal conditions

GNNs are particularly suitable for this setting because they explicitly operate on graph structures and allow information to propagate through connected entities.

The fundamental idea is:

The state of an urban location cannot always be understood independently of the network surrounding it.

🔮 Future Research Extensions

The current prototype primarily focuses on road-network intervention analysis.

The framework can later be extended to:

🚇 Public Transportation
Metro stations
Bus networks
Transit demand
Transit accessibility
Intermodal connectivity
🏥 Urban Facilities
Hospitals
Schools
Emergency facilities
Service accessibility
Facility placement
🏗️ Land Use
Residential areas
Commercial areas
Industrial areas
Mixed-use development
Land-use transitions
🌱 Environment
Air pollution
Carbon emissions
Energy consumption
Environmental impacts
🚨 Infrastructure Resilience
Road failures
Infrastructure disruptions
Emergency accessibility
Network vulnerability
Disaster scenarios
🏙️ Urban Planning
New roads
Road closures
Capacity changes
New transit infrastructure
Facility placement
Land-use changes
🆚 Current Prototype vs Future Research System
Current Prototype	Future Research System
Frontend simulation	Real urban datasets
Simulated traffic	Real traffic observations
Demonstration GNN logic	Trained GNN/ST-GNN
Illustrative predictions	Experimentally validated predictions
Controlled interventions	Real/simulated intervention datasets
Visual spillover	Quantitative spillover evaluation
Demonstration uncertainty	Calibrated uncertainty
Interactive scenarios	Systematic experiments
Conceptual analysis	Formal evaluation

Therefore:

The website demonstrates the research concept and provides an interactive experimental environment. It does not currently claim experimentally validated GNN performance.

🛠️ Technology Stack
Frontend
React
TypeScript
Vite
CSS
Simulation
TypeScript-based urban simulation
Graph generation
Graph construction
Traffic simulation
Vehicle simulation
Routing
Scenario engine
Intervention engine
Metrics
AI / Graph Concepts
Graph Neural Networks
GCN
GAT
GraphSAGE
GIN
Temporal GNNs
Heterogeneous GNNs
Counterfactual Graph Learning
Development & Deployment
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
1. Clone the repository
git clone https://github.com/Srijan1710228/GNN-URBAN-INTELLIGENCE-LAB.git
2. Enter the project directory
cd GNN-URBAN-INTELLIGENCE-LAB
3. Install dependencies
npm install
4. Start the development server
npm run dev

Vite will provide the local development URL in the terminal.

🧪 Project Status

Current Stage: Interactive Research Prototype

Currently Demonstrated
✅ Interactive urban environment
✅ Urban graph representation
✅ Graph nodes and edges
✅ Graph inspection
✅ GNN neighborhood exploration
✅ 1-hop / 2-hop / 3-hop analysis
✅ GNN message-passing concepts
✅ Traffic simulation
✅ Vehicle simulation
✅ Road capacity interventions
✅ Road closure scenarios
✅ Capacity increase scenarios
✅ Scenario comparison
✅ Spillover visualization
✅ Impact analysis
✅ Graph algorithms
✅ Counterfactual analysis concepts
✅ Research knowledge layer
✅ Research assistant interface
✅ Intervention-aware GNN simulation concepts
🚧 Research Development Roadmap

The next stages of development are intended to move from the frontend prototype toward an experimentally validated research system.

Phase 1 — Literature Review

Study:

GNNs
ST-GNNs
Urban computing
Traffic forecasting
Intervention-aware learning
Counterfactual learning
GeoAI
Explainable GNNs
Phase 2 — Real Urban Graph

Construct graph representations from real urban data.

Potential data sources include:

OpenStreetMap
Traffic datasets
Public transportation datasets
Urban GIS datasets
Simulation platforms
Phase 3 — Baseline Prediction

Develop and evaluate:

Historical baseline
MLP
Random Forest / XGBoost
GCN
GraphSAGE
GAT
ST-GNN
Phase 4 — Intervention Dataset

Generate controlled interventions such as:

Road closure
Capacity reduction
Capacity increase
New road connection
Phase 5 — Intervention-Aware GNN

Train a model capable of estimating the consequences of graph modifications.

Phase 6 — Spillover Analysis

Measure:

Direct effects
Local effects
2-hop effects
3-hop effects
Network-wide effects
Phase 7 — Generalization

Evaluate the model on:

Unseen intervention locations
Unseen intervention magnitudes
Unseen intervention combinations
Different network regions
Phase 8 — Explainability

Investigate why the model predicts a particular intervention effect.

Potential factors include:

Neighbouring roads
Capacity
Traffic state
Connectivity
Network topology
Temporal context
Phase 9 — Uncertainty

Develop uncertainty estimates and evaluate whether the model knows when it is less reliable.

Phase 10 — Decision Support

Eventually compare multiple candidate interventions based on objectives such as:

Traffic efficiency
Accessibility
Environmental impact
Network resilience
Infrastructure cost
⚠️ Scientific Limitations

The current prototype has several important limitations.

1. Simulated Data

The current environment does not represent a validated real-world traffic dataset.

2. No Trained Production GNN

The current GNN functionality is primarily designed to demonstrate concepts and simulation behaviour.

3. Illustrative Predictions

Displayed prediction values are not claimed as research results.

4. No Causal Guarantee

Changing the graph and observing a different prediction does not automatically establish a causal effect.

5. Simplified Urban Environment

The simulated city does not capture all real-world factors such as:

Human behaviour
Weather
Incidents
Public transportation interactions
Complex demand patterns
Policy constraints
Economic effects

These limitations define the gap between the current prototype and the future research system.

🎓 Research Significance

The project sits at the intersection of:

Graph Neural Networks
Graph Theory
Urban Computing
Transportation
GeoAI
Machine Learning
Simulation
Counterfactual Learning
Urban Planning
Decision Support

The central research direction is to move from:

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
Explainable Urban Decision Support
📌 Vision

The long-term vision of GNN Urban Intelligence Lab is to create an interactive environment where researchers and urban planners can move beyond asking:

"What is happening in the city?"

and:

"What will happen next?"

toward asking:

"What happens if we change the city?"

The ultimate goal is to connect:

URBAN DATA
    ↓
GRAPH REPRESENTATION
    ↓
GRAPH NEURAL NETWORKS
    ↓
URBAN SIMULATION
    ↓
INFRASTRUCTURE INTERVENTION
    ↓
COUNTERFACTUAL SCENARIOS
    ↓
SPILLOVER ANALYSIS
    ↓
EXPLAINABILITY + UNCERTAINTY
    ↓
DECISION SUPPORT
👨‍💻 Author

Srijan Prakash

B.Tech — Computer Science & Engineering (AI & ML)

SRM Institute of Science and Technology

📄 License

This project is currently intended as a research and educational prototype.

License and contribution guidelines can be added as the project moves toward public research development.

⭐ Project Philosophy

Model the city as a graph.
Learn how the network behaves.
Change the network.
Observe what happens.
Understand why.

GNN Urban Intelligence Lab
From understanding the city to asking what if.


After pasting and saving `README.md`, run:

```bash
git add README.md
git commit -m "Add comprehensive project documentation"
git push

Then refresh your GitHub repository — the full README will render automatically
