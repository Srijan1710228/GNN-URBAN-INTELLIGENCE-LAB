import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Panel, Button, StatusIndicator } from './UIComponents';
import { Send } from 'lucide-react';
import { buildUrbanGraph } from '../simulation/graphBuilder';
import { getNodeNeighbors, getNodeDegree } from '../simulation/graphAlgorithms';

// Import knowledge files
import { graphBasics } from '../knowledge/graphBasics';
import { graphTypes } from '../knowledge/graphTypes';
import { graphAlgorithms } from '../knowledge/graphAlgorithms';
import { gnnBasics } from '../knowledge/gnnBasics';
import { gcn } from '../knowledge/gcn';
import { graphSage } from '../knowledge/graphSage';
import { gat } from '../knowledge/gat';
import { gin } from '../knowledge/gin';
import { temporalGnn } from '../knowledge/temporalGnn';
import { heterogeneousGnn } from '../knowledge/heterogeneousGnn';
import { urbanGnn } from '../knowledge/urbanGnn';
import { counterfactuals } from '../knowledge/counterfactuals';
import { urbanPlanning } from '../knowledge/urbanPlanning';
import { researchMethodology } from '../knowledge/researchMethodology';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  mode?: 'CHAT' | 'RESEARCH' | 'TEACHING';
  level?: 'BASIC' | 'TECHNICAL' | 'URBAN' | 'RESEARCH_LIMITS';
}

export const ResearchAssistant: React.FC = () => {
  const { cityData, selectedNodeId, selectedEdgeId, simState, interventions } = useApp();

  const [chatMode, setChatMode] = useState<'CHAT' | 'RESEARCH' | 'TEACHING'>('TEACHING');
  const [explainLevel, setExplainLevel] = useState<'BASIC' | 'TECHNICAL' | 'URBAN' | 'RESEARCH_LIMITS'>('TECHNICAL');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Welcome to the GNN Research Assistant & Urban Planning Mentor. Ask any question about spatial representations, GNN layers, message passing, or your selected intersection/road in the study area.",
      mode: 'TEACHING',
      level: 'TECHNICAL'
    }
  ]);

  const [inputVal, setInputVal] = useState<string>('');

  // Build live graph for context queries
  const graph = buildUrbanGraph(cityData, simState);
  const selectedNode = selectedNodeId ? graph.nodes.get(selectedNodeId) : null;
  const neighbors = selectedNodeId ? getNodeNeighbors(selectedNodeId, graph) : [];
  const degree = selectedNodeId ? getNodeDegree(selectedNodeId, graph) : 0;

  // Selected road edge context
  const selectedEdge = selectedEdgeId ? cityData.roads.get(selectedEdgeId) : null;

  // Format Time representation
  const formatSimTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getAssistantResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    // 10 Example Q&A Patterns (seeded as requested)
    if (q.includes('what is a graph in urban planning') || (q.includes('what') && q.includes('graph') && q.includes('planning'))) {
      return "An urban graph represents a city as interconnected entities rather than only as geographic space. For a road network, intersections can be represented as nodes and road segments as edges. Additional information such as traffic density, road capacity, speed and demand can be attached as node or edge features. This representation allows a model to reason about how conditions at one part of the network relate to connected parts.";
    }
    
    if (q.includes('why are gnns useful') || q.includes('why use gnns') || q.includes('gnns useful for cities')) {
      return "Cities are highly interconnected systems. Traffic at one intersection can affect neighboring intersections, and changes to one road can redistribute movement through alternative routes. A GNN is designed to learn from this relational structure by allowing information from neighboring nodes to contribute to a node's representation. This makes GNNs suitable for problems such as traffic forecasting, mobility modelling and network-level urban analysis.";
    }

    if (q.includes('what is message passing') && (q.includes('city') || q.includes('here'))) {
      return "Message passing means that a graph node receives information from its neighboring nodes and uses that information to update its own representation. In this urban network, the selected intersection can receive information about traffic, speed, queues and other features from connected intersections. The GNN aggregates that neighborhood information before producing an updated representation or prediction.";
    }

    if (q.includes('why can\'t we just use a normal neural network') || q.includes('why not cnn') || q.includes('why not normal neural')) {
      return "A conventional neural network does not naturally represent the irregular connectivity of a road network. A city does not have a fixed rectangular structure where every location has the same neighbors. Intersections have different numbers of connections and roads have different relationships. GNNs explicitly operate on this graph structure, allowing the model to use the relationships between urban entities.";
    }

    if (q.includes('what happens if i close') || q.includes('close this road')) {
      let edgeContext = "";
      if (selectedEdge) {
        edgeContext = `Specifically, closing road segment ${selectedEdge.id} (connecting ${selectedEdge.startNode} to ${selectedEdge.endNode}) removes this edge from the graph. `;
      }
      return `${edgeContext}Closing a road changes the network structure by removing or disabling an edge. Vehicles that previously used that connection must find alternative routes. This can redistribute traffic to neighboring roads and intersections. In a planning simulation, we can compare the baseline network with the modified network and measure changes in travel time, congestion, throughput and accessibility. The exact consequences should be determined from the simulation rather than assumed in advance.`;
    }

    if (q.includes('prediction different from planning') || q.includes('prediction vs planning') || q.includes('prediction vs intervention')) {
      return "Prediction asks what is likely to happen under the current or assumed future conditions. Planning asks what may happen if we deliberately change the system.\n\nFor example:\n- Prediction: 'What will traffic look like 30 minutes from now?'\n- Planning: 'What happens if we add a road or change a transit connection?'\n\nThe second question requires evaluating an intervention and comparing the resulting scenario with a baseline.";
    }

    if (q.includes('prove') && q.includes('adding a road') && q.includes('congestion')) {
      return "No. A predictive GNN can learn statistical relationships and produce predictions for a scenario, but prediction alone does not establish causal validity. An intervention model requires assumptions about how the system responds to the change, and those assumptions need validation. Therefore, a GNN-based planning system should distinguish prediction, simulation and causal claims.";
    }

    if (q.includes('why does the gnn need neighboring') || q.includes('why does the gnn need neighbors')) {
      return "Because an intersection's state is influenced by the network around it. For example, congestion upstream can affect the arrival of vehicles at the selected intersection. Likewise, conditions downstream can influence route choices. The GNN uses neighboring nodes and their relationships to capture these network effects rather than treating each intersection as an independent observation.";
    }

    if (q.includes('can the gnn tell me which road') || q.includes('which road i should build')) {
      return "Not automatically. A GNN can potentially provide predictions for candidate scenarios, but choosing a road is an optimization and planning problem. A useful system would generate or receive candidate interventions, evaluate their predicted consequences, consider objectives such as congestion, accessibility and cost, and then compare the alternatives. The GNN would therefore be part of a larger intervention-evaluation framework rather than being treated as an autonomous planner.";
    }

    if (q.includes('what is the main research idea') || q.includes('research vision') || q.includes('central idea')) {
      return "The central idea is to move from using GNNs only to predict urban phenomena toward using graph-based models to evaluate urban planning interventions.\n\nThe workflow is:\nREAL CITY → GRAPH → DYNAMIC URBAN STATE → GNN → PREDICTION → INTERVENTION → MODIFIED GRAPH → COUNTERFACTUAL SCENARIO → COMPARISON → DECISION SUPPORT.\n\nThe research question is whether a dynamic and heterogeneous graph representation combined with GNNs can reliably model network-wide consequences of urban planning interventions.";
    }

    // Context-specific handling for "Why is this intersection congested?" or "Why did traffic increase here?"
    if (q.includes('congested') || q.includes('traffic') || q.includes('speed') || q.includes('queue')) {
      if (selectedNode) {
        const speedText = selectedNode.features.averageSpeed < 25 ? 'congested/slow' : 'free-flowing';
        const queueText = selectedNode.features.queueLength > 5 ? 'forming a queue' : 'minimal queue';
        return `[SIMULATED] Intersection ${selectedNode.id} is experiencing ${speedText} traffic flow at ${selectedNode.features.averageSpeed} km/h with a queue of ${selectedNode.features.queueLength} vehicles (${queueText}). 
Its local degree is ${degree} connected edges, meaning traffic propagates from ${neighbors.join(', ')}. 
Under our model's assumptions, congestion at this node is driven by the spatial bottleneck structure combined with a Peak Demand setting of ${simState.demandSetting} at simulated time ${formatSimTime(simState.timeOfDaySeconds)}.`;
      }
      if (selectedEdge) {
        return `[SIMULATED] Road segment ${selectedEdge.id} (Type: ${selectedEdge.roadType}) has a current traffic density of ${(selectedEdge.density * 100).toFixed(0)}% and travel time of ${selectedEdge.travelTime}s. 
Congestion is rated as ${selectedEdge.status}. Since it connects node ${selectedEdge.startNode} to ${selectedEdge.endNode}, changes in routing will directly alter the flow rate (currently ${selectedEdge.currentFlow} vehicles/hr).`;
      }
    }

    // Generic fallback mapping to knowledge base
    let data = graphBasics;
    if (q.includes('basics') || q.includes('what is a graph')) {
      data = graphBasics;
    } else if (q.includes('types') || q.includes('taxonomy') || q.includes('heterogeneous') || q.includes('multigraph')) {
      data = graphTypes;
    } else if (q.includes('dijkstra') || q.includes('path') || q.includes('shortest') || q.includes('centrality')) {
      data = graphAlgorithms;
    } else if (q.includes('message passing') || q.includes('aggregate') || q.includes('update')) {
      data = gnnBasics;
    } else if (q.includes('gcn') || q.includes('convolutional')) {
      data = gcn;
    } else if (q.includes('sage') || q.includes('graphsage')) {
      data = graphSage;
    } else if (q.includes('attention') || q.includes('gat')) {
      data = gat;
    } else if (q.includes('isomorphism') || q.includes('gin')) {
      data = gin;
    } else if (q.includes('temporal') || q.includes('spatio-temporal')) {
      data = temporalGnn;
    } else if (q.includes('heterogeneous gnn')) {
      data = heterogeneousGnn;
    } else if (q.includes('urban') || q.includes('traffic') || q.includes('mobility')) {
      data = urbanGnn;
    } else if (q.includes('counterfactual') || q.includes('intervention') || q.includes('what happens if')) {
      data = counterfactuals;
    } else if (q.includes('planning') || q.includes('decision') || q.includes('trade-off')) {
      data = urbanPlanning;
    } else {
      data = researchMethodology;
    }

    // Format based on explain level (BASIC, TECHNICAL, URBAN, RESEARCH)
    switch (explainLevel) {
      case 'BASIC':
        return `[CONCEPTUAL] ${data.title}:\n${data.intuition}`;
      case 'TECHNICAL':
        return `[MODEL ASSUMPTION] ${data.title} Mathematical Formulation:\n\`\`\`latex\n${data.mathematics}\n\`\`\``;
      case 'URBAN':
        return `[SIMULATED] ${data.title} in City Planning:\n${data.urbanExample}`;
      case 'RESEARCH_LIMITS':
        return `[RESEARCH HYPOTHESIS] ${data.title} Limitations & Assumptions:\n${data.researchImplication}\n\n*Warning: Counterfactual scenario predictions represent consequences under the assumptions of the model. They do not by themselves establish causal effects in the real world.*`;
      default:
        return data.intuition;
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Fetch response
    setTimeout(() => {
      let responseText = getAssistantResponse(text);

      // Append selected context details if available
      if (selectedNode) {
        responseText += `\n\n**Selected Intersection Context (Node: ${selectedNode.id})**:\n` +
          `- Traffic Density: ${(selectedNode.features.trafficDensity * 100).toFixed(0)}% [SIMULATED]\n` +
          `- Queue Length: ${selectedNode.features.queueLength} vehicles [SIMULATED]\n` +
          `- Connected Edges (Degree): ${degree} [KNOWN]\n` +
          `- Peak hour setting: ${simState.demandSetting} [ASSUMED]`;
      } else if (selectedEdge) {
        responseText += `\n\n**Selected Road Context (Edge: ${selectedEdge.id})**:\n` +
          `- Current Density: ${(selectedEdge.density * 100).toFixed(0)}% [SIMULATED]\n` +
          `- Speed Limit: ${selectedEdge.speedLimit} km/h [ASSUMED]\n` +
          `- Active lane capacity: ${selectedEdge.capacity} vehicles/hr [ASSUMED]`;
      }

      if (interventions.length > 0) {
        responseText += `\n\n**Proposed Interventions Applied [PROPOSED]**:\n` +
          interventions.map(i => `- ${i.description}`).join('\n');
      }

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        sender: 'assistant',
        text: responseText,
        mode: chatMode,
        level: explainLevel
      };
      setMessages(prev => [...prev, assistantMsg]);
    }, 150);
  };

  const suggestedQuestions = [
    "What is a graph in urban planning?",
    "Why are GNNs useful for cities?",
    "What is message passing in this city?",
    "Why can't we just use a normal neural network?",
    "What happens if I close this road?",
    "How is prediction different from planning?",
    "Does a GNN prove that adding a road will reduce congestion?",
    "Why does the GNN need neighboring intersections?",
    "Can the GNN tell me which road I should build?",
    "What is the main research idea of this project?"
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, height: '100%' }}>
      {/* LEFT: Chat Conversation Thread */}
      <Panel 
        title="GNN Research Dialogue"
        headerActions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {/* Explain Level Buttons */}
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
              {(['BASIC', 'TECHNICAL', 'URBAN', 'RESEARCH_LIMITS'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setExplainLevel(lvl)}
                  style={{
                    padding: '2px 6px', fontSize: '8px', fontWeight: 600, border: 'none', cursor: 'pointer',
                    backgroundColor: explainLevel === lvl ? 'var(--color-accent-dim)' : 'var(--bg-tertiary)',
                    color: explainLevel === lvl ? 'var(--color-accent)' : 'var(--text-secondary)'
                  }}
                >
                  {lvl === 'RESEARCH_LIMITS' ? 'LIMITS' : lvl}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setChatMode('CHAT')}
                className="btn"
                style={{
                  padding: '2px 6px', fontSize: '8px', fontWeight: 600,
                  backgroundColor: chatMode === 'CHAT' ? 'var(--color-accent-dim)' : '',
                  borderColor: chatMode === 'CHAT' ? 'var(--color-accent)' : '',
                  color: chatMode === 'CHAT' ? 'var(--color-accent)' : ''
                }}
              >
                CHAT
              </button>
              <button
                onClick={() => setChatMode('RESEARCH')}
                className="btn"
                style={{
                  padding: '2px 6px', fontSize: '8px', fontWeight: 600,
                  backgroundColor: chatMode === 'RESEARCH' ? 'var(--color-accent-dim)' : '',
                  borderColor: chatMode === 'RESEARCH' ? 'var(--color-accent)' : '',
                  color: chatMode === 'RESEARCH' ? 'var(--color-accent)' : ''
                }}
              >
                RESEARCH
              </button>
              <button
                onClick={() => setChatMode('TEACHING')}
                className="btn"
                style={{
                  padding: '2px 6px', fontSize: '8px', fontWeight: 600,
                  backgroundColor: chatMode === 'TEACHING' ? 'var(--color-accent-dim)' : '',
                  borderColor: chatMode === 'TEACHING' ? 'var(--color-accent)' : '',
                  color: chatMode === 'TEACHING' ? 'var(--color-accent)' : ''
                }}
              >
                TEACHING
              </button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '440px' }}>
          
          {/* Messages Thread */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '360px' }}>
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    backgroundColor: isUser ? 'var(--color-accent-dim)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderColor: isUser ? 'var(--color-accent)' : 'var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
            style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: 'auto' }}
          >
            <input
              type="text"
              placeholder="Ask the Research Assistant..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '12px'
              }}
            />
            <Button type="submit" icon={<Send size={12} />}>
              SEND
            </Button>
          </form>
        </div>
      </Panel>

      {/* RIGHT: Suggested Questions & Handbook Reference */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* SUGGESTED QUESTIONS */}
        <Panel title="SUGGESTED QUESTIONS">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '320px', overflowY: 'auto' }}>
            {suggestedQuestions.map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {q}
              </button>
            ))}
          </div>
        </Panel>

        {/* METAPATH LEGEND REFERENCE */}
        <Panel title="SCIENTIFIC DICTIONARY">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '11px', lineHeight: 1.4 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <StatusIndicator status="success" label="KNOWN" />
              <span className="text-secondary">Empirical observations or parameters.</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <StatusIndicator status="active" label="ASSUMED" />
              <span className="text-secondary">Underlying simulation rules or parameters.</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <StatusIndicator status="active" label="SIMULATED" />
              <span className="text-secondary">Simulated dynamic traffic metrics.</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <StatusIndicator status="idle" label="HYPOTHESIS" />
              <span className="text-secondary">Predictions generated by GNN models.</span>
            </div>
          </div>
        </Panel>

      </div>
    </div>
  );
};
export default ResearchAssistant;
