import React from 'react';
import { Arrow } from 'react-konva';
import useStore from '../store/useStore';

const Connector = ({ connector }) => {
  const shapes = useStore((state) => state.shapes);
  
  const fromShape = shapes[connector.from];
  const toShape = shapes[connector.to];

  // Safety check: If a shape was deleted, don't crash
  if (!fromShape || !toShape) return null;

  // --- HELPER: GET CENTER OF ANY SHAPE ---
  const getCenter = (shape) => {
    const width = shape.width || 100;
    const height = shape.height || 100;

    // List of shapes drawn from TOP-LEFT
    // (Rect, Sticky, Image, and SVG Paths like Cloud/Database usually)
    const topLeftTypes = ['rect', 'sticky', 'image', 'cloud', 'database', 'speech', 'cube', 'arrowRight'];

    if (topLeftTypes.includes(shape.type)) {
        return {
            x: shape.x + width / 2,
            y: shape.y + height / 2
        };
    } 
    
    // List of shapes drawn from CENTER
    // (Circle, Polygon, etc.)
    return {
        x: shape.x,
        y: shape.y
    };
  };

  const start = getCenter(fromShape);
  const end = getCenter(toShape);

  return (
    <Arrow
      points={[start.x, start.y, end.x, end.y]}
      stroke="white"
      strokeWidth={2}
      pointerLength={10}
      pointerWidth={10}
      fill="white"
      opacity={0.8}
      listening={false} // Don't steal clicks
    />
  );
};

export default Connector;