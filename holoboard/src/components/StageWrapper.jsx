import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, RegularPolygon, Text, Transformer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import dagre from 'dagre';
import useStore from '../store/useStore';
import Connector from './Connector';
import Cursors from './Cursors'; // <--- 1. NEW IMPORT

const GRID_SIZE = 40;

const StageWrapper = () => {
  const shapes = useStore((state) => state.shapes);
  const connectors = useStore((state) => state.connectors);
  const selectedId = useStore((state) => state.selectedId);
  const mode = useStore((state) => state.mode);
  const connectingFromId = useStore((state) => state.connectingFromId);
  const stageState = useStore((state) => state.stage);

  const updateShape = useStore((state) => state.updateShape);
  const selectShape = useStore((state) => state.selectShape);
  const setConnectingFrom = useStore((state) => state.setConnectingFrom);
  const addConnector = useStore((state) => state.addConnector);
  const setStage = useStore((state) => state.setStage);
  const deleteSelected = useStore((state) => state.deleteSelected);

  const transformerRef = useRef();
  const stageRef = useRef();

  // --- KEYBOARD SHORTCUTS (FIXED) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't delete if user is typing in an input field (Properties Panel)
      const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (isTyping) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  // --- LISTENERS (Layout & Export) ---
  useEffect(() => {
    const handleExport = () => {
      if (!stageRef.current) return;
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'holoboard-design.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleAutoLayout = () => {
      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: 'LR', ranksep: 150, nodesep: 100 });
      g.setDefaultEdgeLabel(() => ({}));

      // Feed nodes
      Object.values(shapes).forEach(shape => {
        g.setNode(shape.id, { width: shape.width || 100, height: shape.height || 100 });
      });

      // Feed edges
      Object.values(connectors).forEach(conn => {
        if (shapes[conn.from] && shapes[conn.to]) {
           g.setEdge(conn.from, conn.to);
        }
      });

      dagre.layout(g);

      // Apply positions with Center vs Top-Left correction
      g.nodes().forEach(nodeId => {
        const node = g.node(nodeId);
        const shape = shapes[nodeId];
        if (!shape) return;

        let newX = node.x;
        let newY = node.y;

        if (shape.type === 'rect' || shape.type === 'sticky') {
            newX = node.x - (shape.width || 100) / 2;
            newY = node.y - (shape.height || 100) / 2;
        } 
        updateShape(nodeId, { x: newX, y: newY });
      });
    };

    window.addEventListener('export-image', handleExport);
    window.addEventListener('auto-layout', handleAutoLayout);
    
    return () => {
      window.removeEventListener('export-image', handleExport);
      window.removeEventListener('auto-layout', handleAutoLayout);
    };
  }, [shapes, connectors]);

  // --- TRANSFORMER ---
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = transformerRef.current.getStage().findOne('#' + selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, shapes]);

  // --- MOUSE & ZOOM ---
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStage({
      scale: newScale,
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const handleShapeClick = (id) => {
    if (mode === 'select') {
      selectShape(id);
    } else if (mode === 'connect') {
      if (!connectingFromId) {
        setConnectingFrom(id);
      } else {
        if (id !== connectingFromId) {
           addConnector({ id: uuidv4(), from: connectingFromId, to: id });
           setConnectingFrom(null);
        }
      }
    }
  };

  const handleShapeDoubleClick = (id) => {
    const newText = prompt("Enter label:", shapes[id].text);
    if (newText !== null) {
      updateShape(id, { text: newText });
    }
  };

  const handleDragEnd = (e, id) => {
    const x = Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE;
    const y = Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE;
    e.target.to({ x, y, duration: 0.1 });
    updateShape(id, { x, y });
  };

  const handleTransformEnd = () => {
    const node = transformerRef.current.nodes()[0];
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    updateShape(node.id(), {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * scaleX),
      height: Math.max(20, node.height() * scaleY),
    });
  };

  // --- RENDER SHAPE HELPER ---
  const renderShape = (shape) => {
    const isRect = shape.type === 'rect';
    const isSticky = shape.type === 'sticky'; 
    const width = shape.width || 100;
    const height = shape.height || 100;

    let fallbackFill = "#ff6b6b";
    if (shape.type === 'circle') fallbackFill = "#4ecdc4";
    if (shape.type === 'sticky') fallbackFill = "#fff740";

    const fill = shape.fill || fallbackFill;
    const isHighlight = mode === 'connect' && connectingFromId === shape.id;

    // Sticky Note styling
    const shadowBlur = selectedId === shape.id ? 20 : (isSticky ? 10 : 5);
    const shadowOffset = isSticky ? {x: 5, y: 5} : {x: 0, y: 0};
    const shadowOpacity = isSticky ? 0.3 : 1;

    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      draggable: mode === 'select',
      onClick: () => handleShapeClick(shape.id),
      onDblClick: () => handleShapeDoubleClick(shape.id),
      onDragEnd: (e) => handleDragEnd(e, shape.id),
      onTransformEnd: handleTransformEnd,
      shadowBlur,
      shadowColor: selectedId === shape.id ? '#646cff' : 'black',
      shadowOffset,
      shadowOpacity,
      stroke: isHighlight ? "white" : null,
      strokeWidth: isHighlight ? 3 : 0,
      fill,
    };

    return (
      <React.Fragment key={shape.id}>
        {isRect && <Rect {...commonProps} width={width} height={height} cornerRadius={8} />}
        {isSticky && <Rect {...commonProps} width={width} height={height} cornerRadius={2} />}
        {shape.type === 'circle' && <Circle {...commonProps} radius={50} />}
        {shape.type === 'diamond' && <RegularPolygon {...commonProps} sides={4} radius={60} scaleY={0.8} rotation={0} />}

        <Text
          x={isRect || isSticky ? shape.x : shape.x - 50}
          y={isRect || isSticky ? shape.y : shape.y - 50}
          width={isRect || isSticky ? width : 100}
          height={isRect || isSticky ? height : 100}
          text={shape.text || "Text"}
          align="center"
          verticalAlign="middle"
          fontSize={14}
          fontStyle="bold"
          fill={fill === '#000000' ? '#fff' : '#1a1a1a'}
          listening={false}
        />
      </React.Fragment>
    );
  };

  return (
    <div className="canvas-container">
      <Stage 
        ref={stageRef}
        width={window.innerWidth} 
        height={window.innerHeight}
        draggable={mode === 'select'}
        onWheel={handleWheel}
        scaleX={stageState.scale}
        scaleY={stageState.scale}
        x={stageState.x}
        y={stageState.y}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            selectShape(null);
            setConnectingFrom(null);
          }
        }}
      >
        <Layer>
          {Object.values(connectors).map((conn) => <Connector key={conn.id} connector={conn} />)}
          {Object.values(shapes).map(renderShape)}

          {/* 2. RENDER CURSORS */}
          <Cursors stageRef={stageRef} />

          {selectedId && mode === 'select' && <Transformer ref={transformerRef} />}
        </Layer>
      </Stage>
    </div>
  );
};

export default StageWrapper;