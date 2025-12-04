import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StageWrapper from '../components/StageWrapper';
import Toolbar from '../components/Toolbar';
import PropertiesPanel from '../components/PropertiesPanel';
import Navbar from '../components/Navbar';
import ZoomControls from '../components/ZoomControls';
import Minimap from '../components/Minimap';
import useStore from '../store/useStore';

const Board = () => {
  const { roomId } = useParams();
  
 
  const theme = useStore((state) => state.theme);
  const gridColor = useStore((state) => state.gridColor);
  const shapes = useStore((state) => state.shapes);
  
  
  const syncWithYjs = useStore((state) => state.syncWithYjs);
  const addShape = useStore((state) => state.addShape);
  const addConnector = useStore((state) => state.addConnector);

 
  useEffect(() => {
    if (roomId) {
      
      syncWithYjs(roomId);

      
      const loadFromCloud = async () => {
        try {
          
          const response = await fetch(`https://glorious-succotash-wrg7466vjpx629599-1234.app.github.dev/api/board/${roomId}`);
          const dbData = await response.json();

          if (dbData && dbData.data) {
             
             if (Object.keys(shapes).length === 0) {
                 console.log("☁️ Loading saved board from MongoDB...");
                 const { shapes: savedShapes, connectors: savedConnectors } = dbData.data;
                 
               
                 if (savedShapes) {
                    Object.values(savedShapes).forEach(shape => addShape(shape));
                 }
                 
                 if (savedConnectors) {
                    Object.values(savedConnectors).forEach(conn => addConnector(conn));
                 }
             } else {
                 console.log(" Connected to live session (skipping DB load).");
             }
          }
        } catch (error) {
          console.error("Failed to load board from cloud:", error);
        }
      };

      
      const timer = setTimeout(loadFromCloud, 1000);
      return () => clearTimeout(timer);
    }
  }, [roomId, syncWithYjs]);


  useEffect(() => {
    document.documentElement.style.setProperty('--grid-color', gridColor);
  }, [gridColor]);

  return (
    <div className={`app-container ${theme === 'light' ? 'light-mode' : ''}`}>
      <Navbar />
      <Toolbar />
      <PropertiesPanel />
      
      {/* CANVAS */}
      <StageWrapper />
      
      {/* OVERLAYS */}
      <Minimap />
      <ZoomControls /> 
    </div>
  );
};

export default Board;
