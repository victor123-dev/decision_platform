import { useMemo } from 'react';
import { useD3ForceGraph } from '../hooks/useD3ForceGraph';

export default function OntologyGraph({ objectTypes, actionTypes, linkTypes, onSelect, selectedId }) {
  const graphData = useMemo(() => {
    const nodes = [
      ...objectTypes.map(ot => ({
        id: ot.id,
        name: ot.displayName,
        type: 'business_model',
        description: ot.description,
        data: ot
      })),
      ...actionTypes.map(at => ({
        id: at.id,
        name: at.displayName,
        type: 'action',
        description: at.description,
        data: at
      }))
    ];

    const links = [
      ...linkTypes.map(lt => ({
        id: lt.id,
        source: `obj-${lt.source}`,
        target: `obj-${lt.target}`,
        name: lt.displayName,
        description: lt.description,
        data: lt
      })),
      ...actionTypes
        .filter(at => at.target_model_id)
        .map(at => ({
          id: `action-target-${at.id}`,
          source: at.id,
          target: at.target_model_id,
          name: '作用于',
          description: `${at.displayName} 作用于目标`,
          data: { type: 'action_to_model', actionId: at.id }
        }))
    ];

    return { nodes, links };
  }, [objectTypes, actionTypes, linkTypes]);

  const { svgRef } = useD3ForceGraph(graphData, onSelect || (() => {}), selectedId);

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}
    />
  );
}
