import React from 'react';
import { Arrow } from 'react-konva';
import useStore from '../store/useStore';

const Connector = ({ connector }) => {
  const shapes = useStore((state) => state.shapes);
  
  const fromShape = shapes[connector.from];
  const toShape = shapes[connector.to];

  // If one of the shapes was deleted, don't draw the line
  if (!fromShape || !toShape) return null;

  // Simple math: Draw from Center to Center
  // (Day 3 we can make this smarter to touch edges)
  const fromX = fromShape.x + (fromShape.type === 'rect' ? 50 : 0);
  const fromY = fromShape.y + (fromShape.type === 'rect' ? 50 : 0);
  
  const toX = toShape.x + (toShape.type === 'rect' ? 50 : 0);
  const toY = toShape.y + (toShape.type === 'rect' ? 50 : 0);

  return (
    <Arrow
      points={[fromX, fromY, toX, toY]}
      stroke="white"
      strokeWidth={2}
      pointerLength={10}
      pointerWidth={10}
      fill="white"
    />
  );
};

export default Connector;