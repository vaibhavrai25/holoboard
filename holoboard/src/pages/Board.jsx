import React, { useEffect } from 'react';
import StageWrapper from '../components/StageWrapper';
import Toolbar from '../components/Toolbar';
import PropertiesPanel from '../components/PropertiesPanel';
import Navbar from '../components/Navbar';
import useStore from '../store/useStore';

// This is essentially your old App.jsx
const Board = () => {
  const theme = useStore((state) => state.theme);
  const gridColor = useStore((state) => state.gridColor);

  useEffect(() => {
    document.documentElement.style.setProperty('--grid-color', gridColor);
  }, [gridColor]);

  return (
    <div className={`app-container ${theme === 'light' ? 'light-mode' : ''}`}>
      <Navbar />
      <Toolbar />
      <PropertiesPanel />
      <StageWrapper />
    </div>
  );
};

export default Board;