import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StageWrapper from '../components/StageWrapper';
import Toolbar from '../components/Toolbar';
import PropertiesPanel from '../components/PropertiesPanel';
import Navbar from '../components/Navbar';
import ZoomControls from '../components/ZoomControls'; // <--- Ensure this is here
import useStore from '../store/useStore';
import Minimap from '../components/Minimap';

const Board = () => {
  const { roomId } = useParams();
  const theme = useStore((state) => state.theme);
  const gridColor = useStore((state) => state.gridColor);
  const syncWithYjs = useStore((state) => state.syncWithYjs);

  // Connect to the room when the page loads
  useEffect(() => {
    if (roomId) {
      syncWithYjs(roomId);
    }
  }, [roomId, syncWithYjs]);

  // Update CSS variable for Grid Color
  useEffect(() => {
    document.documentElement.style.setProperty('--grid-color', gridColor);
  }, [gridColor]);

  return (
    <div className={`app-container ${theme === 'light' ? 'light-mode' : ''}`}>
      <Navbar />
      <Toolbar />
      <PropertiesPanel />
      
      {/* The Main Canvas */}
      <StageWrapper />
      <Minimap />
      
      {/* Floating Zoom Controls */}
      <ZoomControls /> 
    </div>
  );
};

export default Board;