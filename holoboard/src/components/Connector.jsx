import React from 'react';
import { Arrow } from 'react-konva';
import useStore from '../store/useStore';

const Connector = ({ connector }) => {
  const shapes = useStore((state) => state.shapes);
  
  const fromShape = shapes[connector.from];
  const toShape = shapes[connector.to];


  if (!fromShape || !toShape) return null;

  const getCenter = (shape) => {
    const width = shape.width || 100;
    const height = shape.height || 100;

  
    const topLeftTypes = ['rect', 'sticky', 'image', 'cloud', 'database', 'speech', 'cube', 'arrowRight'];

    if (topLeftTypes.includes(shape.type)) {
        return {
            x: shape.x + width / 2,
            y: shape.y + height / 2
        };
    } 
    
  
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
      listening={false} 
    />
  );
};

export default Connector;
