import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, RegularPolygon, Line, Image as KonvaImage } from 'react-konva';
import useStore from '../store/useStore';
import useImage from 'use-image';


const BASE_WIDTH = 240; 
const SCALE = 0.10; 
const PADDING = 20;
const BOTTOM_OFFSET = 80; 


const MiniURLImage = ({ shape, ...props }) => {
  const [img] = useImage(shape.src);
  return <KonvaImage image={img} {...props} />;
};

const Minimap = () => {
  const shapes = useStore((state) => state.shapes);
  const stageState = useStore((state) => state.stage);
  const setStage = useStore((state) => state.setStage);
  const theme = useStore((state) => state.theme);


  const [isOpen, setIsOpen] = useState(true);
  
  
  const [mapDims, setMapDims] = useState({ 
    width: BASE_WIDTH, 
    height: BASE_WIDTH * (window.innerHeight / window.innerWidth) 
  });

  
  const [position, setPosition] = useState({ 
    x: window.innerWidth - BASE_WIDTH - PADDING, 
    y: window.innerHeight - (BASE_WIDTH * (window.innerHeight / window.innerWidth)) - BOTTOM_OFFSET 
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  
  useEffect(() => {
    const handleResize = () => {
      const ratio = window.innerHeight / window.innerWidth;
      const newHeight = BASE_WIDTH * ratio;
      
      setMapDims({ width: BASE_WIDTH, height: newHeight });

      
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - BASE_WIDTH - PADDING),
        y: Math.min(prev.y, window.innerHeight - newHeight - PADDING)
      }));
    };

  
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  
  const viewX = (-stageState.x / stageState.scale) * SCALE;
  const viewY = (-stageState.y / stageState.scale) * SCALE;
  const viewW = (window.innerWidth / stageState.scale) * SCALE;
  const viewH = (window.innerHeight / stageState.scale) * SCALE;

  const handleMapClick = (e) => {
    e.evt.cancelBubble = true; 
    const clickX = e.evt.layerX;
    const clickY = e.evt.layerY;
    const newStageX = -(clickX / SCALE) * stageState.scale + window.innerWidth / 2;
    const newStageY = -(clickY / SCALE) * stageState.scale + window.innerHeight / 2;
    setStage({ scale: stageState.scale, x: newStageX, y: newStageY });
  };

  
  const renderMiniShape = (shape) => {
    const props = {
      key: shape.id,
      x: shape.x * SCALE,
      y: shape.y * SCALE,
      fill: shape.fill || '#ccc',
      listening: false 
    };

    if (shape.type === 'rect' || shape.type === 'sticky') {
        return <Rect {...props} width={(shape.width || 100) * SCALE} height={(shape.height || 100) * SCALE} cornerRadius={2} />;
    }
    if (shape.type === 'circle') {
        return <Circle {...props} radius={50 * SCALE} />;
    }
    if (shape.type === 'diamond') {
        return <RegularPolygon {...props} sides={4} radius={60 * SCALE} />;
    }
    if (shape.type === 'image') {
        return <MiniURLImage shape={shape} {...props} width={200 * SCALE} height={150 * SCALE} />;
    }
    
  
    if (shape.type === 'line' || shape.type === 'eraser') {
        const isEraser = shape.type === 'eraser';
        return (
            <Line 
                key={shape.id}
                points={shape.points.map(p => p * SCALE)}
                stroke={isEraser ? '#000' : (shape.stroke || '#ccc')}
                strokeWidth={(shape.strokeWidth || 3) * SCALE} 
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={isEraser ? 'destination-out' : 'source-over'}
            />
        );
    }
    return null;
  };

  if (!isOpen) {
    return (
        <button 
            onClick={() => setIsOpen(true)}
            style={{
                position: 'fixed', bottom: '80px', right: '20px',
                width: '40px', height: '40px', borderRadius: '8px', 
                border: '1px solid var(--button-border)', background: 'var(--toolbar-bg)', 
                color: 'var(--text-color)', fontSize: '20px', cursor: 'pointer', zIndex: 90,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'transform 0.2s'
            }}
            title="Open Minimap"
        >
            🗺️
        </button>
    );
  }

  return (
    <div 
        style={{
            ...styles.container, 
            width: mapDims.width,   
            height: mapDims.height + 24, 
            left: position.x, 
            top: position.y,
            cursor: isDragging ? 'grabbing' : 'default'
        }}
    >
      <div style={styles.header}>
        <div style={styles.dragArea} onMouseDown={handleMouseDown}>
            <div style={styles.gripLines}></div>
        </div>
        <button onClick={() => setIsOpen(false)} style={styles.closeBtn} title="Minimize">–</button>
      </div>

      <Stage 
        width={mapDims.width} 
        height={mapDims.height} 
        onClick={handleMapClick}
        style={{cursor: 'crosshair'}}
      >
        <Layer>
          {/* Background */}
          <Rect width={mapDims.width} height={mapDims.height} fill={theme === 'light' ? '#fff' : '#222'} />
          
          <React.Fragment>
             {/* Origin Marker */}
             <Rect x={mapDims.width/2} y={mapDims.height/2} width={2} height={2} fill="red" />
             
             {/* Shapes Group */}
             <group x={mapDims.width/2} y={mapDims.height/2}>
                {Object.values(shapes).map(shape => {
                    if (shape.type === 'line' || shape.type === 'eraser') return null;
                    return renderMiniShape(shape);
                })}
             </group>
          </React.Fragment>
        </Layer>

        <Layer>
             <group x={mapDims.width/2} y={mapDims.height/2}>
                {Object.values(shapes).map(shape => {
                    if (shape.type !== 'line' && shape.type !== 'eraser') return null;
                    return renderMiniShape(shape);
                })}
             </group>
        </Layer>

        <Layer>
          {/* Viewport Indicator */}
          <Rect
            x={(mapDims.width/2) + viewX}
            y={(mapDims.height/2) + viewY}
            width={viewW}
            height={viewH}
            stroke="#4ecdc4"
            strokeWidth={1} 
            fill="rgba(78, 205, 196, 0.2)"
          />
        </Layer>
      </Stage>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    backgroundColor: 'var(--toolbar-bg)', border: '2px solid var(--toolbar-border)',
    borderRadius: '8px', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 90,
    display: 'flex', flexDirection: 'column', backdropFilter: 'blur(5px)'
  },
  header: { height: '24px', width: '100%', background: 'var(--button-bg)', display: 'flex', borderBottom: '1px solid var(--toolbar-border)' },
  dragArea: { flex: 1, cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  gripLines: { width: '30px', height: '4px', borderTop: '2px solid #888', borderBottom: '2px solid #888', opacity: 0.5 },
  closeBtn: { width: '30px', height: '100%', background: 'transparent', border: 'none', borderLeft: '1px solid var(--toolbar-border)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default Minimap;
