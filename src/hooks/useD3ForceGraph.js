import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

const GRAPH_CONFIG = {
  NODE_RADIUS: 24,
  LINK_DISTANCE: 180,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 4,
  DEFAULT_STROKE: '#CBD5E1',
  SELECTED_STROKE: '#FF4D4F',
  NODE_DEFAULT_FILL: '#FFFFFF',
  NODE_SELECTED_FILL: '#EFF6FF',
  NODE_STROKE: '#2563EB',
  ACTION_NODE_FILL: '#FFF7ED',
  ACTION_NODE_STROKE: '#EA580C',
  LABEL_FONT_SIZE: 12,
};

export const useD3ForceGraph = (data, onSelect, selectedId) => {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const elementsRef = useRef({ links: null, nodes: null, linkGroup: null, nodeGroup: null, linkLabelGroup: null });
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Stable key derived from data content to avoid re-initializing on every render
  const dataKey = useMemo(() => {
    if (!data || !data.nodes || !data.links) return '';
    const nodeIDs = data.nodes.map(n => n.id).sort().join(',');
    const linkIDs = data.links.map(l => l.id).sort().join(',');
    return `${nodeIDs}|${linkIDs}`;
  }, [data]);

  // 1. 初始化画布 (only when dataKey changes)
  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes || !data.links) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    svg.selectAll("*").remove();
    const g = svg.append("g");

    // 箭头标记
    svg.append("defs")
      .append("marker")
      .attr("id", "arrowhead-static")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", GRAPH_CONFIG.NODE_RADIUS + 12)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("markerUnits", "userSpaceOnUse")
      .append("path")
      .attr("d", "M 0,-4 L 10,0 L 0,4")
      .attr("fill", GRAPH_CONFIG.DEFAULT_STROKE);

    svg.select("defs")
      .append("marker")
      .attr("id", "arrowhead-selected")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", GRAPH_CONFIG.NODE_RADIUS + 12)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("markerUnits", "userSpaceOnUse")
      .append("path")
      .attr("d", "M 0,-4 L 10,0 L 0,4")
      .attr("fill", GRAPH_CONFIG.SELECTED_STROKE);

    // 缩放
    const zoom = d3.zoom()
      .scaleExtent([GRAPH_CONFIG.MIN_ZOOM, GRAPH_CONFIG.MAX_ZOOM])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // 层级：Links -> LinkLabels -> Nodes
    const linkGroup = g.append("g").attr("class", "links");
    const linkLabelGroup = g.append("g").attr("class", "link-labels");
    const nodeGroup = g.append("g").attr("class", "nodes");

    // 获取所有节点ID
    const nodeIds = new Set(data.nodes.map(d => d.id));
    
    // 过滤掉引用不存在节点的边
    const validLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
    
    // 力模拟
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(validLinks).id(d => d.id).distance(GRAPH_CONFIG.LINK_DISTANCE))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(GRAPH_CONFIG.NODE_RADIUS * 2));

    simulationRef.current = simulation;
    elementsRef.current = { linkGroup, nodeGroup, linkLabelGroup };

    // 渲染边（过滤自引用）
    const links = linkGroup.selectAll("line")
      .data(validLinks.filter(d => d.source !== d.target), d => d.id);

    links.enter().append("line")
      .attr("stroke", GRAPH_CONFIG.DEFAULT_STROKE)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead-static)")
      .attr("cursor", d => d.data?.type === 'action_to_model' ? 'default' : 'pointer')
      .on("click", (event, d) => {
        event.stopPropagation();
        if (d.data?.type === 'action_to_model') return;
        const originalLink = {
          id: d.id,
          source: d.source?.id || d.source,
          target: d.target?.id || d.target,
          name: d.name,
          description: d.description,
          data: d.data
        };
        onSelectRef.current({ type: 'link', data: originalLink });
      })
      .merge(links);

    links.exit().remove();

    // 自引用边
    const selfLinks = linkGroup.selectAll("path.self-link")
      .data(validLinks.filter(d => d.source === d.target), d => d.id);

    selfLinks.enter().append("path")
      .attr("class", "self-link")
      .attr("fill", "none")
      .attr("stroke", GRAPH_CONFIG.DEFAULT_STROKE)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead-static)")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        const originalLink = {
          id: d.id,
          source: d.source?.id || d.source,
          target: d.target?.id || d.target,
          name: d.name,
          description: d.description,
          data: d.data
        };
        onSelectRef.current({ type: 'link', data: originalLink });
      })
      .merge(selfLinks);

    selfLinks.exit().remove();

    // 边标签
    const labelGroups = linkLabelGroup.selectAll("g")
      .data(validLinks.filter(d => d.source !== d.target), d => d.id);

    const labelEnter = labelGroups.enter().append("g").attr("class", "link-label-container");
    labelEnter.append("rect")
      .attr("fill", "#FFFFFF")
      .attr("rx", 4)
      .attr("ry", 4);
    labelEnter.append("text")
      .attr("font-size", "12px")
      .attr("fill", "#475569")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text(d => d.name);

    labelGroups.exit().remove();

    // 自引用边标签
    const selfLabelGroups = linkLabelGroup.selectAll("g.self-link-label")
      .data(validLinks.filter(d => d.source === d.target), d => d.id);

    const selfLabelEnter = selfLabelGroups.enter().append("g")
      .attr("class", "link-label-container self-link-label");
    selfLabelEnter.append("rect")
      .attr("fill", "#FFFFFF")
      .attr("rx", 4)
      .attr("ry", 4);
    selfLabelEnter.append("text")
      .attr("font-size", "12px")
      .attr("fill", "#475569")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text(d => d.name);

    selfLabelGroups.exit().remove();

    // 节点
    const nodeGroups = nodeGroup.selectAll("g")
      .data(data.nodes, d => d.id);

    const nodeEnter = nodeGroups.enter().append("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    nodeEnter.append("circle")
      .attr("r", GRAPH_CONFIG.NODE_RADIUS)
      .attr("fill", d => {
        if (d.type === 'action') return GRAPH_CONFIG.ACTION_NODE_FILL;
        return GRAPH_CONFIG.NODE_DEFAULT_FILL;
      })
      .attr("stroke", d => {
        if (d.type === 'action') return GRAPH_CONFIG.ACTION_NODE_STROKE;
        return GRAPH_CONFIG.NODE_STROKE;
      })
      .attr("stroke-width", 2);

    nodeEnter.append("text")
      .attr("dy", GRAPH_CONFIG.NODE_RADIUS + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(d => d.name);

    nodeEnter.on("click", (event, d) => {
      event.stopPropagation();
      const originalNode = {
        id: d.id,
        name: d.name,
        type: d.type,
        description: d.description,
        data: d.data
      };
      onSelectRef.current({ type: d.type === 'action' ? 'action' : 'business_model', data: originalNode });
    });

    nodeGroups.exit().remove();

    // Tick动画循环
    simulation.on("tick", () => {
      linkGroup.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      linkGroup.selectAll("path.self-link")
        .attr("d", d => {
          const radius = GRAPH_CONFIG.NODE_RADIUS;
          const loopRadius = radius * 2.5;
          const startX = d.source.x + radius;
          const startY = d.source.y;
          const cp1x = d.source.x + radius;
          const cp1y = d.source.y - loopRadius;
          const cp2x = d.source.x - radius;
          const cp2y = d.source.y - loopRadius;
          const endX = d.source.x - radius;
          const endY = d.source.y;
          return `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
        });

      linkLabelGroup.selectAll("g:not(.self-link-label)")
        .attr("transform", d => `translate(${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`)
        .each(function() {
          const text = d3.select(this).select("text");
          const bbox = text.node()?.getBBox();
          if (bbox) {
            d3.select(this).select("rect")
              .attr("x", bbox.x - 4)
              .attr("y", bbox.y - 2)
              .attr("width", bbox.width + 8)
              .attr("height", bbox.height + 4);
          }
        });

      linkLabelGroup.selectAll("g.self-link-label")
        .attr("transform", d => {
          const radius = GRAPH_CONFIG.NODE_RADIUS;
          const loopRadius = radius * 2.5;
          return `translate(${d.source.x}, ${d.source.y - loopRadius})`;
        })
        .each(function() {
          const text = d3.select(this).select("text");
          const bbox = text.node()?.getBBox();
          if (bbox) {
            d3.select(this).select("rect")
              .attr("x", bbox.x - 4)
              .attr("y", bbox.y - 2)
              .attr("width", bbox.width + 8)
              .attr("height", bbox.height + 4);
          }
        });

      nodeGroup.selectAll("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    svg.on("click", () => onSelectRef.current(null));

    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  // 2. 选中样式更新
  useEffect(() => {
    if (!elementsRef.current.linkGroup || !elementsRef.current.nodeGroup) return;

    const { linkGroup, nodeGroup } = elementsRef.current;

    linkGroup.selectAll("line")
      .attr("stroke", d => d.id === selectedId ? GRAPH_CONFIG.SELECTED_STROKE : GRAPH_CONFIG.DEFAULT_STROKE)
      .attr("stroke-width", d => d.id === selectedId ? 4 : 2)
      .attr("marker-end", d => d.id === selectedId ? "url(#arrowhead-selected)" : "url(#arrowhead-static)");

    linkGroup.selectAll("path.self-link")
      .attr("stroke", d => d.id === selectedId ? GRAPH_CONFIG.SELECTED_STROKE : GRAPH_CONFIG.DEFAULT_STROKE)
      .attr("stroke-width", d => d.id === selectedId ? 4 : 2)
      .attr("marker-end", d => d.id === selectedId ? "url(#arrowhead-selected)" : "url(#arrowhead-static)");

    nodeGroup.selectAll("g").select("circle")
      .attr("fill", d => {
        if (d.id === selectedId) return GRAPH_CONFIG.NODE_SELECTED_FILL;
        if (d.type === 'action') return GRAPH_CONFIG.ACTION_NODE_FILL;
        return GRAPH_CONFIG.NODE_DEFAULT_FILL;
      })
      .attr("stroke", d => {
        if (d.id === selectedId) return GRAPH_CONFIG.SELECTED_STROKE;
        if (d.type === 'action') return GRAPH_CONFIG.ACTION_NODE_STROKE;
        return GRAPH_CONFIG.NODE_STROKE;
      })
      .attr("stroke-width", d => d.id === selectedId ? 4 : 2);

  }, [selectedId]);

  return { svgRef };
};
