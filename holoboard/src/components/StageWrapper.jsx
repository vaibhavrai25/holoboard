import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, RegularPolygon, Text, Transformer, Line, Image as KonvaImage, Path, Ellipse, Star, Ring, Arrow } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import dagre from 'dagre';
import useImage from 'use-image';
import useStore from '../store/useStore';
import Connector from './Connector';
import Cursors from './Cursors';

const GRID_SIZE = 40;


const PATHS = {
  cloud: "M25,60 a20,20 0 0,1 0,-40 a20,20 0 0,1 30,-10 a20,20 0 0,1 30,10 a20,20 0 0,1 0,40 z",
  database: "M10,20 C10,10 90,10 90,20 L90,80 C90,90 10,90 10,80 Z M10,20 C10,30 90,30 90,20",
  speech: "M10,10 h80 a10,10 0 0,1 10,10 v50 a10,10 0 0,1 -10,10 h-50 l-15,15 v-15 h-15 a10,10 0 0,1 -10,-10 v-50 a10,10 0 0,1 10,-10 z",
  cube: "M10,30 L50,10 L90,30 L90,80 L50,100 L10,80 Z M10,30 L50,50 L90,30 M50,50 L50,100",
  arrowRight: "M10,40 L60,40 L60,20 L90,50 L60,80 L60,60 L10,60 Z"
};

const URLImage = ({ shape, ...props }) => {
  const [img] = useImage(shape.src);
  return <KonvaImage image={img} x={shape.x} y={shape.y} width={shape.width} height={shape.height} {...props} />;
};

const StageWrapper = () => {
  const shapes = useStore((state) => state.shapes);
  const connectors = useStore((state) => state.connectors);
  const selectedId = useStore((state) => state.selectedId);
  const mode = useStore((state) => state.mode);
  const connectingFromId = useStore((state) => state.connectingFromId);
  const stageState = useStore((state) => state.stage);
  
  const isSnapEnabled = useStore((state) => state.isSnapEnabled);
  const theme = useStore((state) => state.theme);
  const penColor = useStore((state) => state.penColor);
  const penWidth = useStore((state) => state.penWidth);

  const updateShape = useStore((state) => state.updateShape);
  const addShape = useStore((state) => state.addShape);
  const selectShape = useStore((state) => state.selectShape);
  const setConnectingFrom = useStore((state) => state.setConnectingFrom);
  const addConnector = useStore((state) => state.addConnector);
  const setStage = useStore((state) => state.setStage);
  const deleteSelected = useStore((state) => state.deleteSelected);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);

  const transformerRef = useRef();
  const stageRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLineId, setCurrentLineId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const textAreaRef = useRef(null);

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (isTyping) return;
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { if(e.shiftKey) redo(); else undo(); e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { redo(); e.preventDefault(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, undo, redo]);

  useEffect(() => {
    const handleExport = () => { if(stageRef.current){ const uri=stageRef.current.toDataURL({pixelRatio:2}); const link=document.createElement('a'); link.download='holoboard.png'; link.href=uri; document.body.appendChild(link); link.click(); document.body.removeChild(link); }};
    const handleAutoLayout = () => { /* Layout logic */ }; 
    const handleAIGenerate = () => { /* AI logic */ }; 

    window.addEventListener('export-image', handleExport);
    return () => { window.removeEventListener('export-image', handleExport); };
  }, [shapes, connectors, stageState]);

  
  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage()) {
      selectShape(null); setConnectingFrom(null); setEditingId(null);
      if (mode === 'pencil' || mode === 'eraser') {
        setIsDrawing(true); const id = uuidv4(); setCurrentLineId(id);
        const pos = e.target.getStage().getRelativePointerPosition();
        addShape({ id, type: mode === 'eraser'?'eraser':'line', points:[pos.x,pos.y], stroke: mode==='eraser'?'#000':penColor, strokeWidth: penWidth });
      }
    }
  };
  const handleMouseMove = (e) => {
    if ((mode==='pencil'||mode==='eraser') && isDrawing && currentLineId) {
       const pos = e.target.getStage().getRelativePointerPosition();
       const l = shapes[currentLineId]; if(l) updateShape(currentLineId, { points: l.points.concat([pos.x,pos.y]) });
    }
  };
  const handleMouseUp = () => { setIsDrawing(false); setCurrentLineId(null); };
  const handleWheel = (e) => { e.evt.preventDefault(); if(e.evt.ctrlKey) { const s=e.target.getStage(); const os=s.scaleX(); const p=s.getPointerPosition(); const mp={x:(p.x-s.x())/os, y:(p.y-s.y())/os}; const ns=e.evt.deltaY<0?os*1.1:os/1.1; setStage({scale:ns, x:p.x-mp.x*ns, y:p.y-mp.y*ns}); } else { setStage({scale:stageState.scale, x:stageState.x-e.evt.deltaX, y:stageState.y-e.evt.deltaY}); }};
  const handleDrop = (e) => { e.preventDefault(); stageRef.current.setPointersPositions(e); const f=e.dataTransfer.files[0]; if(f&&f.type.startsWith('image/')){ const r=new FileReader(); r.onload=()=>{ const pos=stageRef.current.getRelativePointerPosition(); addShape({id:uuidv4(), type:'image', src:r.result, x:pos.x, y:pos.y, width:200, height:150}); }; r.readAsDataURL(f); }};
  
  const handleShapeClick = (id) => { if(mode==='select') selectShape(id); else if(mode==='connect') { if(!connectingFromId) setConnectingFrom(id); else { if(id!==connectingFromId) addConnector({id:uuidv4(), from:connectingFromId, to:id}); setConnectingFrom(null); } }};
  const handleShapeDoubleClick = (id) => { setEditingId(id); selectShape(id); };
  const handleDragEnd = (e,id) => { let x=e.target.x(); let y=e.target.y(); if(isSnapEnabled){ x=Math.round(x/GRID_SIZE)*GRID_SIZE; y=Math.round(y/GRID_SIZE)*GRID_SIZE; } e.target.to({x,y,duration:0.1}); updateShape(id,{x,y}); };
  const handleTransformEnd = () => { const n=transformerRef.current.nodes()[0]; if(!n)return; const sx=n.scaleX(); const sy=n.scaleY(); const rot=n.rotation(); n.scaleX(1); n.scaleY(1); updateShape(n.id(), {x:n.x(), y:n.y(), rotation:rot, width:Math.max(20,n.width()*sx), height:Math.max(20,n.height()*sy)}); };

  
  const renderShape = (shape) => {
    const props = {
      id: shape.id, draggable: mode === 'select',
      onClick: () => handleShapeClick(shape.id),
      onDragEnd: (e) => handleDragEnd(e, shape.id),
      onTransformEnd: handleTransformEnd,
      onDblClick: () => handleShapeDoubleClick(shape.id),
      // Bind Rotation
      rotation: shape.rotation || 0,
    };

    let fill = shape.fill || "#ff6b6b";
    let w = shape.width || 100;
    let h = shape.height || 100;
    const isHighlight = mode === 'connect' && connectingFromId === shape.id;
    const stroke = isHighlight ? "white" : (["line","eraser","arrow-shape"].includes(shape.type) ? (shape.stroke||'#df4b26') : "black");
    const strokeWidth = isHighlight ? 3 : (["line","eraser","arrow-shape"].includes(shape.type) ? (shape.strokeWidth||3) : 1);
    const shadowBlur = selectedId === shape.id ? 20 : 5;
    const isEditing = editingId === shape.id;

 
    const renderText = (centered = true) => {
        if (isEditing) return null;
        
        let tx = centered ? shape.x : shape.x-w/2;
        let ty = centered ? shape.y : shape.y-h/2;
        
        
        if (shape.type === 'cloud') ty += 10; 
        if (shape.type === 'database') ty += 5;

        return <Text x={tx} y={ty} width={w} height={h} text={shape.text||""} align="center" verticalAlign="middle" fontSize={14} fontStyle="bold" fill={fill==='#000000'?'#fff':'#1a1a1a'} listening={false} />;
    };

    if (shape.type === 'arrow-shape') {
        
        return (
            <React.Fragment key={shape.id}>
                {/* Invisible hit box for easier selection */}
                <Rect {...props} x={shape.x} y={shape.y - 15} width={w} height={30} fill="transparent" />
                <Arrow 
                    {...props}
                    points={[0, 0, w, 0]} 
                    x={shape.x} y={shape.y}
                    pointerLength={10} pointerWidth={10}
                    fill={fill} stroke={fill} strokeWidth={4} 
                    shadowBlur={shadowBlur}
                />
                {!isEditing && <Text 
                    x={shape.x} y={shape.y - 20} width={w} 
                    text={shape.text || ""} 
                    align="center" fontSize={14} fontStyle="bold" fill="#1a1a1a" listening={false} 
                    rotation={shape.rotation} 
                />}
            </React.Fragment>
        );
    }

    if (shape.type === 'rect' || shape.type === 'sticky') {
        const isSticky = shape.type === 'sticky';
        return <React.Fragment key={shape.id}>
            <Rect {...props} x={shape.x} y={shape.y} width={w} height={h} fill={fill} cornerRadius={isSticky?2:8} shadowBlur={shadowBlur} stroke={stroke} strokeWidth={strokeWidth} />
            {renderText(false)}
        </React.Fragment>;
    }
    if (shape.type === 'circle') return <React.Fragment key={shape.id}><Circle {...props} x={shape.x} y={shape.y} radius={w/2} fill={fill} shadowBlur={shadowBlur} stroke={stroke} strokeWidth={strokeWidth} />{renderText(false)}</React.Fragment>;
    if (shape.type === 'diamond') return <React.Fragment key={shape.id}><RegularPolygon {...props} x={shape.x} y={shape.y} sides={4} radius={w/2+10} fill={fill} shadowBlur={shadowBlur} stroke={stroke} strokeWidth={strokeWidth} />{renderText(false)}</React.Fragment>;
    
   
    if (['triangle','pentagon','hexagon','octagon'].includes(shape.type)) {
        const sides = {triangle:3, pentagon:5, hexagon:6, octagon:8}[shape.type];
        return <React.Fragment key={shape.id}><RegularPolygon {...props} x={shape.x} y={shape.y} sides={sides} radius={w/2} fill={fill} shadowBlur={shadowBlur} stroke={stroke} strokeWidth={strokeWidth} />{renderText(false)}</React.Fragment>;
    }
    if (shape.type === 'star') return <React.Fragment key={shape.id}><Star {...props} x={shape.x} y={shape.y} numPoints={5} innerRadius={w/4} outerRadius={w/2} fill={fill} shadowBlur={shadowBlur} stroke={stroke} strokeWidth={strokeWidth} />{renderText(false)}</React.Fragment>;
    if (shape.type === 'ellipse') return <React.Fragment key={shape.id}><Ellipse {...props} x={shape.x} y={shape.y} radiusX={w/2} radiusY={h/3} fill={fill} shadowBlur={shadowBlur} stroke={stroke} strokeWidth={strokeWidth} />{renderText(false)}</React.Fragment>;
    if (shape.type === 'ring') return <React.Fragment key={shape.id}><Ring {...props} x={shape.x} y={shape.y} innerRadius={w/3} outerRadius={w/2} fill={fill} shadowBlur={shadowBlur} stroke={stroke} strokeWidth={strokeWidth} />{renderText(false)}</React.Fragment>;
    
    
    if (PATHS[shape.type]) {
        return <React.Fragment key={shape.id}>
            <Path {...props} x={shape.x - w/2} y={shape.y - h/2} data={PATHS[shape.type]} fill={fill} scaleX={w/100} scaleY={h/100} shadowBlur={shadowBlur} stroke={stroke} strokeWidth={strokeWidth} />
            {renderText(false)}
        </React.Fragment>;
    }

    if (shape.type === 'image') return <URLImage key={shape.id} shape={shape} {...props} />;
    
   
    if (shape.type === 'line' || shape.type === 'eraser') {
        const isEraser = shape.type === 'eraser';
        return <Line key={shape.id} points={shape.points} stroke={isEraser ? '#000' : (shape.stroke || '#df4b26')} strokeWidth={shape.strokeWidth || 3} tension={0.5} lineCap="round" lineJoin="round" globalCompositeOperation={isEraser ? 'destination-out' : 'source-over'} listening={!isEraser && mode === 'select'} onClick={() => mode === 'select' && selectShape(shape.id)} draggable={mode === 'select'} onDragEnd={(e) => updateShape(shape.id, { x: e.target.x(), y: e.target.y() })} />;
    }
    return null;
  };

  const renderEditingTextarea = () => {
    if (!editingId || !shapes[editingId]) return null;
    const shape = shapes[editingId];
    const scale = stageState.scale;
    let tx = shape.x; let ty = shape.y; let tw = shape.width||100; let th = shape.height||100;
    
    const isCentered = !['rect', 'sticky', 'image', 'line', 'eraser', 'arrow-shape'].includes(shape.type);
    if(isCentered) { tx -= tw/2; ty -= th/2; }
    
    
    if (shape.type === 'cloud') ty += 10;
    if (shape.type === 'database') ty += 5;
    if (shape.type === 'arrow-shape') ty -= 25; 

    const sx = tx * scale + stageState.x;
    const sy = ty * scale + stageState.y;
    
    return <textarea ref={textAreaRef} value={shape.text||""} onChange={(e) => updateShape(editingId, { text: e.target.value })} onBlur={() => setEditingId(null)} autoFocus style={{ position: 'absolute', top: sy, left: sx, width: tw*scale, height: th*scale, fontSize: `${14*scale}px`, fontWeight: 'bold', textAlign: 'center', color: shape.fill==='#000000'?'#fff':'#1a1a1a', background: 'transparent', border: '1px dashed #4ecdc4', outline: 'none', resize: 'none', overflow: 'hidden', paddingTop: `${(th*scale)/2 - 8}px`, lineHeight: 1.2, fontFamily: 'Inter, sans-serif' }} />;
  };

  useEffect(() => { if (selectedId && transformerRef.current) { const n = transformerRef.current.getStage().findOne('#' + selectedId); if (n) { transformerRef.current.nodes([n]); transformerRef.current.getLayer().batchDraw(); } } }, [selectedId, shapes]);

  return (
    <div className="canvas-container" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel} draggable={mode === 'select'} onDragEnd={(e) => { if (e.target === stageRef.current) setStage({ scale: stageState.scale, x: e.target.x(), y: e.target.y() }); }} scaleX={stageState.scale} scaleY={stageState.scale} x={stageState.x} y={stageState.y}>
        <Layer>
            {Object.values(connectors).map((conn) => <Connector key={conn.id} connector={conn} />)}
            {Object.values(shapes).map(s => { if (s.type === 'line' || s.type === 'eraser') return null; return renderShape(s); })}
            <Cursors stageRef={stageRef} />
            {selectedId && mode === 'select' && <Transformer ref={transformerRef} />}
        </Layer>
        <Layer>
            {Object.values(shapes).map(s => { if (s.type !== 'line' && s.type !== 'eraser') return null; return renderShape(s); })}
        </Layer>
      </Stage>
      {renderEditingTextarea()}
    </div>
  );
};

export default StageWrapper;
