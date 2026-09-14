import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildUrbanGraph } from '../simulation/graphBuilder';
import { getNodeNeighbors, calculateShortestPath } from '../simulation/graphAlgorithms';

export const CityCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    cityData,
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,
    selectedNodeIds,
    setSelectedNodeIds,
    selectedEdgeIds,
    setSelectedEdgeIds,
    gnnInfluenceHop,
    gnnInfluenceEnabled,
    simState,
    viewMode,
    routeStartId,
    routeEndId,
    cameraX,
    cameraY,
    cameraZoom,
    setCameraX,
    setCameraY,
    setCameraZoom
  } = useApp();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Handle Resize
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Compute live graph representations
  const graph = buildUrbanGraph(cityData, simState);

  // Shortest path route if start and end are selected
  const activeRoute = (routeStartId && routeEndId)
    ? calculateShortestPath(routeStartId, routeEndId, graph)
    : null;

  // Calculate dynamic bounding box center of intersections to anchor the map correctly in the viewport
  const getCityCenter = () => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    for (const node of cityData.intersections.values()) {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    }
    
    if (minX === Infinity) {
      return { x: 505, y: 415 }; // fallback
    }
    
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    };
  };

  const cityCenter = getCityCenter();

  // Helper to compute k-hop neighborhood dynamically
  const getKHopNeighborhood = (startId: string, maxHop: number) => {
    const hops = new Map<string, number>();
    hops.set(startId, 0);
    const queue: string[] = [startId];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentHop = hops.get(current)!;
      if (currentHop >= maxHop) continue;
      
      const nodeNeighbors = getNodeNeighbors(current, graph);
      for (const n of nodeNeighbors) {
        if (!hops.has(n)) {
          hops.set(n, currentHop + 1);
          queue.push(n);
        }
      }
    }
    return hops;
  };

  // Zoom / Pan controls
  const handleZoomIn = () => {
    setCameraZoom(Math.max(0.2, Math.min(4, cameraZoom * 1.2)));
  };

  const handleZoomOut = () => {
    setCameraZoom(Math.max(0.2, Math.min(4, cameraZoom / 1.2)));
  };

  const handleReset = () => {
    setCameraX(0);
    setCameraY(0);
    setCameraZoom(0.85);
  };

  const handleFit = () => {
    setCameraX(0);
    setCameraY(0);
    setCameraZoom(0.95);
  };

  // Canvas Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    ctx.save();
    ctx.translate(dimensions.width / 2 + cameraX, dimensions.height / 2 + cameraY);
    ctx.scale(cameraZoom, cameraZoom);
    ctx.translate(-cityCenter.x, -cityCenter.y); // Anchor city center exactly to viewport center

    // --- A. GRID LAYER (GRAPH & HYBRID mode only) ---
    if (viewMode === 'GRAPH' || viewMode === 'HYBRID') {
      ctx.strokeStyle = '#141a24';
      ctx.lineWidth = 0.5;
      const spacing = 80;
      for (let x = -1000; x <= 2000; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, -1000);
        ctx.lineTo(x, 2000);
        ctx.stroke();
      }
      for (let y = -1000; y <= 2000; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(-1000, y);
        ctx.lineTo(2000, y);
        ctx.stroke();
      }
    }

    // --- GEOGRAPHIC BASEMAP (CITY & HYBRID mode only) ---
    if (viewMode === 'CITY' || viewMode === 'HYBRID') {
      // 1. Draw Cubbon Park forest area (forest green)
      ctx.fillStyle = 'rgba(6, 78, 59, 0.45)';
      ctx.beginPath();
      ctx.arc(180, 180, 150, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw park pathways
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(180, 180, 80, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw Ulsoor Lake water area (blue-cyan)
      ctx.fillStyle = 'rgba(8, 145, 178, 0.4)';
      ctx.beginPath();
      ctx.moveTo(850, 120);
      ctx.quadraticCurveTo(900, 80, 950, 130);
      ctx.quadraticCurveTo(980, 180, 930, 220);
      ctx.quadraticCurveTo(890, 250, 860, 200);
      ctx.quadraticCurveTo(830, 150, 850, 120);
      ctx.fill();

      // 3. Chinnaswamy Cricket Stadium (white stadium circle and green field)
      ctx.fillStyle = 'rgba(2, 132, 199, 0.35)'; // Blue outer structure
      ctx.beginPath();
      ctx.arc(320, 150, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(21, 128, 61, 0.45)'; // Green turf
      ctx.beginPath();
      ctx.arc(320, 150, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Pitch strip
      ctx.fillRect(315, 140, 10, 20);

      // 4. Metro Viaduct (overhead railway line along y=280)
      ctx.strokeStyle = 'rgba(107, 33, 168, 0.3)'; // Purple line
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100, 280);
      ctx.lineTo(900, 280);
      ctx.stroke();
      
      // Draw cross-ties
      ctx.strokeStyle = 'rgba(59, 7, 100, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 100; x <= 900; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 276);
        ctx.lineTo(x, 284);
        ctx.stroke();
      }

      // 5. Draw Compass / Scale Indicator
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('N', 50, 80);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, 85);
      ctx.lineTo(50, 105);
      ctx.moveTo(46, 89);
      ctx.lineTo(50, 85);
      ctx.lineTo(54, 89);
      ctx.stroke();

      ctx.fillText('100m', 40, 125);
      ctx.beginPath();
      ctx.moveTo(40, 115);
      ctx.lineTo(75, 115);
      ctx.moveTo(40, 112);
      ctx.lineTo(40, 118);
      ctx.moveTo(75, 112);
      ctx.lineTo(75, 118);
      ctx.stroke();

      // Latitude/Longitude Ticks around viewport
      ctx.fillText('12°58\'30"N', 820, 50);
      ctx.fillText('77°36\'15"E', 820, 65);
    }

    // --- B. ZONES LAYER (CITY & HYBRID mode only) ---
    if (viewMode === 'CITY' || viewMode === 'HYBRID') {
      for (const zone of cityData.zones) {
        ctx.fillStyle = zone.color;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = zone.type === 'COMMERCIAL' 
          ? 'rgba(14, 165, 233, 0.12)' 
          : zone.type === 'RESIDENTIAL'
          ? 'rgba(16, 185, 129, 0.12)'
          : zone.type === 'INDUSTRIAL'
          ? 'rgba(245, 158, 11, 0.12)'
          : 'rgba(34, 197, 94, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // --- C. PHYSICAL ROADS & CONGESTION HEATMAP (CITY & HYBRID mode only) ---
    if (viewMode === 'CITY' || viewMode === 'HYBRID') {
      for (const road of cityData.roads.values()) {
        const u = cityData.intersections.get(road.startNode)!;
        const v = cityData.intersections.get(road.endNode)!;
        const isSelected = selectedEdgeIds.includes(road.id);

        let strokeColor = '#1f2937';
        let width = 2;

        if (road.status === 'CONGESTED') {
          strokeColor = '#ef4444';
          width = road.roadType === 'HIGHWAY' ? 5 : 4;
        } else if (road.density > 0.45) {
          strokeColor = '#f59e0b';
          width = road.roadType === 'HIGHWAY' ? 4.5 : 3.5;
        } else if (road.roadType === 'HIGHWAY') {
          strokeColor = '#2563eb';
          width = 4;
        } else if (road.roadType === 'ARTERIAL') {
          strokeColor = '#4b5563';
          width = 3;
        } else {
          strokeColor = '#1f2937';
          width = 1.5;
        }

        // Apply neighborhood dimming based on multi-selection lists
        let alpha = 1.0;
        if (selectedNodeIds.length > 0) {
          const isConnected = selectedNodeIds.some(nId => road.startNode === nId || road.endNode === nId);
          if (!isConnected) {
            alpha = 0.15;
          }
        } else if (selectedEdgeIds.length > 0) {
          if (!isSelected) {
            alpha = 0.15;
          }
        }

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = isSelected ? 'var(--color-accent)' : strokeColor;
        ctx.lineWidth = isSelected ? width + 2 : width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.stroke();

        ctx.globalAlpha = 1.0; // reset
      }
    }

    // --- D. ABSTRACT GRAPH EDGES OVERLAY (GRAPH & HYBRID mode only) ---
    if (viewMode === 'GRAPH' || viewMode === 'HYBRID') {
      for (const edge of graph.edges.values()) {
        const u = graph.nodes.get(edge.source)!;
        const v = graph.nodes.get(edge.target)!;
        const isSelected = selectedEdgeIds.includes(edge.id);
        
        // Highlight neighbors & connected paths of selected nodes
        const isConnectedToSelectedNode = selectedNodeIds.some(nId => edge.source === nId || edge.target === nId);

        let strokeColor = 'rgba(2, 132, 199, 0.4)'; // Dim Abstract blue
        let width = 1;

        if (isSelected) {
          strokeColor = 'var(--color-accent)';
          width = 3;
        } else if (isConnectedToSelectedNode) {
          strokeColor = '#06b6d4'; // Cyan neighbor link
          width = 2;
        }

        let alpha = 1.0;
        if (selectedNodeIds.length > 0) {
          if (!isConnectedToSelectedNode) {
            alpha = 0.15;
          }
        } else if (selectedEdgeIds.length > 0) {
          if (!isSelected) {
            alpha = 0.15;
          }
        }

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.stroke();

        ctx.globalAlpha = 1.0; // reset
      }
    }

    // --- E. BUILDINGS (CITY & HYBRID mode only) ---
    if (viewMode === 'CITY' || viewMode === 'HYBRID') {
      // Dim buildings in hybrid mode to make graph nodes pop out
      ctx.globalAlpha = viewMode === 'HYBRID' ? 0.2 : 0.85;

      for (const bld of cityData.buildings) {
        let bldColor = '#374151';
        if (bld.type === 'COMMERCIAL') bldColor = '#1e3a8a';
        else if (bld.type === 'INDUSTRIAL') bldColor = '#78350f';
        else if (bld.type === 'PARK') bldColor = '#064e3b';

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(bld.x - bld.width / 2 + 1, bld.y - bld.depth / 2 + 1, bld.width, bld.depth);

        ctx.fillStyle = bldColor;
        ctx.fillRect(bld.x - bld.width / 2, bld.y - bld.depth / 2, bld.width, bld.depth);
      }
      ctx.globalAlpha = 1.0; // reset
    }

    // --- F. ACTIVE ROUTE PATH HIGHLIGHT ---
    if (activeRoute) {
      ctx.strokeStyle = '#10b981'; // Glowing Emerald Green
      ctx.lineWidth = 5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (let i = 0; i < activeRoute.path.length; i++) {
        const nodeId = activeRoute.path[i];
        const node = graph.nodes.get(nodeId)!;
        if (i === 0) {
          ctx.moveTo(node.x, node.y);
        } else {
          ctx.lineTo(node.x, node.y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow
    }

    // --- G. VEHICLES LAYER (CITY & HYBRID mode only) ---
    if (viewMode === 'CITY' || viewMode === 'HYBRID') {
      for (const vehicle of simState.vehicles) {
        const road = cityData.roads.get(vehicle.currentRoad);
        if (!road) continue;

        const start = cityData.intersections.get(road.startNode)!;
        const end = cityData.intersections.get(road.endNode)!;

        const x = start.x + (end.x - start.x) * vehicle.position;
        const y = start.y + (end.y - start.y) * vehicle.position;

        ctx.fillStyle = vehicle.color;
        ctx.beginPath();
        if (vehicle.state === 'WAITING') {
          ctx.fillStyle = '#ef4444';
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // --- H. PHYSICAL INTERSECTIONS / ABSTRACT GRAPH VERTICES ---
    for (const node of cityData.intersections.values()) {
      const isSelected = selectedNodeIds.includes(node.id);
      const isStartNode = routeStartId === node.id;
      const isEndNode = routeEndId === node.id;

      // 1. Draw Physical Traffic LEDs (CITY and HYBRID mode only)
      if (viewMode === 'CITY' || viewMode === 'HYBRID') {
        let signalColor = '#ef4444';
        if (node.signalState === 'YELLOW') signalColor = '#f59e0b';
        else if (node.signalState === 'GREEN') signalColor = '#10b981';

        ctx.fillStyle = signalColor;
        ctx.beginPath();
        ctx.arc(node.x + 5, node.y - 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Graph nodes & Halos (GRAPH and HYBRID mode only)
      if (viewMode === 'GRAPH' || viewMode === 'HYBRID') {
        const density = node.trafficDensity;

        let fillColor = '#0f172a';
        let strokeColor = '#64748b';

        if (density > 0.8) {
          strokeColor = '#f43f5e';
          fillColor = 'rgba(244, 63, 94, 0.15)';
        } else if (density > 0.45) {
          strokeColor = '#eab308';
          fillColor = 'rgba(234, 179, 8, 0.15)';
        } else {
          strokeColor = '#06b6d4';
          fillColor = 'rgba(6, 182, 212, 0.15)';
        }

        // Apply neighborhood dimming based on selectedNodeIds
        let alpha = 1.0;
        if (selectedNodeIds.length > 0) {
          const isNeighborOfAny = selectedNodeIds.some(nId => {
            const nodeNeighbors = getNodeNeighbors(nId, graph);
            return nodeNeighbors.includes(node.id);
          });
          if (!isSelected && !isNeighborOfAny) {
            alpha = 0.15;
          }
        } else if (selectedEdgeIds.length > 0) {
          const isEdgeNode = selectedEdgeIds.some(eId => {
            const edge = cityData.roads.get(eId);
            return edge && (node.id === edge.startNode || node.id === edge.endNode);
          });
          if (!isEdgeNode) {
            alpha = 0.15;
          }
        }
        ctx.globalAlpha = alpha;

        // Draw GNN Influence Halo overrides
        if (gnnInfluenceEnabled && selectedNodeId) {
          const influenceHops = getKHopNeighborhood(selectedNodeId, gnnInfluenceHop);
          const hopDist = influenceHops.get(node.id);
          
          if (hopDist !== undefined) {
            if (hopDist === 0) {
              ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
              ctx.beginPath();
              ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
              ctx.fill();
            } else if (hopDist === 1) {
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
              ctx.stroke();
            } else if (hopDist === 2) {
              ctx.strokeStyle = '#f59e0b'; // Gold halo for 2nd hop
              ctx.lineWidth = 2.0;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
              ctx.stroke();
            } else if (hopDist === 3) {
              ctx.strokeStyle = '#ef4444'; // Red halo for 3rd hop
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        } else {
          // Standard halos when GNN Receptive Field overlay is disabled
          if (isSelected) {
            strokeColor = 'var(--color-accent)';
            fillColor = 'var(--color-accent-dim)';
            
            // Selection halo
            ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
            ctx.fill();
          } else if (selectedNodeIds.length > 0) {
            const isNeighborOfAny = selectedNodeIds.some(nId => {
              const nodeNeighbors = getNodeNeighbors(nId, graph);
              return nodeNeighbors.includes(node.id);
            });
            if (isNeighborOfAny) {
              strokeColor = '#06b6d4'; // Cyan neighbor highlight
              fillColor = 'rgba(6, 182, 212, 0.08)';

              ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }

        // Router endpoints
        if (isStartNode || isEndNode) {
          strokeColor = '#10b981';
          fillColor = 'rgba(16, 185, 129, 0.15)';

          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Node ID & Place Label (Smart label visibility based on camera zoom)
        const nodeNameMap: Record<string, string> = {
          'int_0': 'Cubbon Forest Entry',
          'int_1': 'Chinnaswamy West',
          'int_2': 'Queen\'s Statue',
          'int_3': 'Cubbon Park Metro',
          'int_4': 'MG Road Metro Junction',
          'int_5': 'Residency Crossroad',
          'int_6': 'Vittal Mallya Corner',
          'int_7': 'Brigade Corner',
          'int_8': 'Brigade Road Corridor',
          'int_9': 'Church Street West',
          'int_10': 'Museum Square',
          'int_11': 'Church Street East',
          'int_12': 'St. Mark\'s Corner',
          'int_13': 'Mayo Hall Junction',
          'int_14': 'Kasturba Road Junction',
          'int_15': 'Trinity Metro Hub',
          'int_16': 'Residency East Road',
          'int_17': 'Richmond Corner',
          'int_18': 'Commercial Street Cross',
          'int_19': 'MG Road East Junction',
          'int_20': 'St. John\'s Road Link',
          'int_21': 'Ulsoor Lake West',
          'int_22': 'Ulsoor Lake Promenade',
          'int_23': 'Cubbon Road East',
          'int_24': 'Commercial Street Entrance',
          'int_25': 'Richmond Circle Flyover',
          'int_26': 'Trinity Circle Junction',
          'int_27': 'HAL Airport Access Link'
        };

        const labelText = nodeNameMap[node.id] || `Node ${node.id.replace('int_', '')}`;
        ctx.fillStyle = isSelected ? 'var(--color-accent)' : '#94a3b8';
        ctx.font = '8px var(--font-mono)';
        ctx.fillText(`N:${node.id.replace('int_', '')}`, node.x - 14, node.y - 10);

        if (cameraZoom > 0.65 || isSelected) {
          ctx.fillStyle = isSelected ? 'var(--color-accent)' : '#e2e8f0';
          ctx.font = 'bold 9px var(--font-sans)';
          ctx.fillText(labelText, node.x - 18, node.y + 16);
        }

        ctx.globalAlpha = 1.0; // reset
      } else {
        // Just draw physical node dot in CITY mode
        const isSelectedPhys = selectedNodeIds.includes(node.id);
        ctx.fillStyle = isSelectedPhys ? 'var(--color-accent)' : '#4b5563';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }, [cityData, cameraX, cameraY, cameraZoom, dimensions, selectedNodeId, selectedEdgeId, selectedNodeIds, selectedEdgeIds, gnnInfluenceHop, gnnInfluenceEnabled, simState.vehicles, viewMode, routeStartId, routeEndId, activeRoute, cityCenter]);

  // Click & Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setCameraX(cameraX + dx);
    setCameraY(cameraY + dy);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);

    const rect = canvasRef.current!.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = (clickX - dimensions.width / 2 - cameraX) / cameraZoom + cityCenter.x;
    const worldY = (clickY - dimensions.height / 2 - cameraY) / cameraZoom + cityCenter.y;

    // Check node clicks (Intersections / graph nodes co-located)
    let clickedNodeId: string | null = null;
    for (const node of cityData.intersections.values()) {
      const dist = Math.sqrt((node.x - worldX) ** 2 + (node.y - worldY) ** 2);
      if (dist < 10) {
        clickedNodeId = node.id;
        break;
      }
    }

    if (clickedNodeId) {
      // Toggle node in selectedNodeIds
      const exists = selectedNodeIds.includes(clickedNodeId);
      const newIds = exists 
        ? selectedNodeIds.filter(id => id !== clickedNodeId)
        : [...selectedNodeIds, clickedNodeId];
      setSelectedNodeIds(newIds);
      setSelectedNodeId(newIds.length > 0 ? newIds[newIds.length - 1] : null);
      
      // Clear edge highlights
      setSelectedEdgeId(null);
      setSelectedEdgeIds([]);
      return;
    }

    // Check edge clicks (Roads / graph edges co-located)
    let clickedEdgeId: string | null = null;
    for (const road of cityData.roads.values()) {
      const u = cityData.intersections.get(road.startNode)!;
      const v = cityData.intersections.get(road.endNode)!;

      const l2 = (u.x - v.x) ** 2 + (u.y - v.y) ** 2;
      let t = ((worldX - u.x) * (v.x - u.x) + (worldY - u.y) * (v.y - u.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = u.x + t * (v.x - u.x);
      const projY = u.y + t * (v.y - u.y);
      const dist = Math.sqrt((worldX - projX) ** 2 + (worldY - projY) ** 2);

      if (dist < 6) {
        clickedEdgeId = road.id;
        break;
      }
    }

    if (clickedEdgeId) {
      // Toggle edge in selectedEdgeIds
      const exists = selectedEdgeIds.includes(clickedEdgeId);
      const newIds = exists
        ? selectedEdgeIds.filter(id => id !== clickedEdgeId)
        : [...selectedEdgeIds, clickedEdgeId];
      setSelectedEdgeIds(newIds);
      setSelectedEdgeId(newIds.length > 0 ? newIds[newIds.length - 1] : null);
      
      // Clear node highlights
      setSelectedNodeId(null);
      setSelectedNodeIds([]);
    } else {
      // Clicked blank space: clear all
      setSelectedNodeId(null);
      setSelectedNodeIds([]);
      setSelectedEdgeId(null);
      setSelectedEdgeIds([]);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.15;
    const newZoom = e.deltaY < 0 ? cameraZoom * zoomFactor : cameraZoom / zoomFactor;
    setCameraZoom(Math.max(0.2, Math.min(4, newZoom)));
  };

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Navigation Zoom / Pan Controls Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          zIndex: 10
        }}
      >
        <button 
          className="btn" 
          style={{ width: 28, height: 28, padding: 0, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleZoomIn}
          title="Zoom In"
        >
          +
        </button>
        <button 
          className="btn" 
          style={{ width: 28, height: 28, padding: 0, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          −
        </button>
        <button 
          className="btn" 
          style={{ padding: '4px 6px', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleReset}
          title="Reset View"
        >
          RESET
        </button>
        <button 
          className="btn" 
          style={{ padding: '4px 6px', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleFit}
          title="Fit Study Area"
        >
          FIT
        </button>
      </div>

      {/* HUD overlay coordinates / Legend */}
      <div 
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '10px',
          display: 'flex',
          gap: 12,
          pointerEvents: 'none',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#06b6d4' }} />
          <span>Nodes / Flow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '20%', backgroundColor: '#ef4444' }} />
          <span>Blinker / Delay</span>
        </div>
        {routeStartId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Active Router</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default CityCanvas;
