import React from 'react';
import useStore from '../store/useStore';

const ZoomControls = () => {
  const stage = useStore((state) => state.stage);
  const setStage = useStore((state) => state.setStage);

  const handleZoom = (direction) => {
    const scaleBy = 1.2; // Zoom factor
    const oldScale = stage.scale;
    const newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;

    // Zoom towards the CENTER of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Calculate the point in the world (grid) that is currently at the center
    const worldPoint = {
      x: (centerX - stage.x) / oldScale,
      y: (centerY - stage.y) / oldScale,
    };

    // Calculate new position to keep that world point at the center
    const newPos = {
      x: centerX - worldPoint.x * newScale,
      y: centerY - worldPoint.y * newScale,
    };

    setStage({
      scale: newScale,
      x: newPos.x,
      y: newPos.y
    });
  };

  return (
    <div className="panel-base" style={styles.container}>
      <button 
        className="icon-button" 
        style={styles.btn} 
        onClick={() => handleZoom('out')}
        title="Zoom Out"
      >
        −
      </button>
      
      <span style={styles.label}>
        {Math.round(stage.scale * 100)}%
      </span>
      
      <button 
        className="icon-button" 
        style={styles.btn} 
        onClick={() => handleZoom('in')}
        title="Zoom In"
      >
        +
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '12px',
    zIndex: 100, // Above the canvas
  },
  btn: {
    width: '32px',
    height: '32px',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: 0,
    borderRadius: '8px',
  },
  label: {
    minWidth: '45px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
    fontVariantNumeric: 'tabular-nums', // Keeps numbers monospaced so text doesn't jitter
  }
};

export default ZoomControls;