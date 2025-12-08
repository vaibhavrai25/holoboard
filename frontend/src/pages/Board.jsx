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
  
  // Store State
  const theme = useStore((state) => state.theme);
  const gridColor = useStore((state) => state.gridColor);
  const shapes = useStore((state) => state.shapes);
  
  // Store Actions
  const syncWithYjs = useStore((state) => state.syncWithYjs);
  const addShape = useStore((state) => state.addShape);
  const addConnector = useStore((state) => state.addConnector);

  // --- 1. CONNECT & LOAD DATA ---
  useEffect(() => {
    if (roomId) {
      // A. Start Real-time Sync (WebSockets)
      syncWithYjs(roomId);

      // B. Try to Load from Cloud Database (MongoDB)
      const loadFromCloud = async () => {
        try {
          //  CLOUD BACKEND URL
          const response = await fetch(`https://holoboard-backend.onrender.com/api/board/${roomId}`);
          const dbData = await response.json();

          if (dbData && dbData.data) {
             // Logic: Only load from DB if the board appears empty after connecting.
             // This prevents overwriting live data if other people are already working.
             // We check 'shapes' from the store (note: this might be empty initially until sync finishes)
             // The 500ms delay helps ensure we gave Yjs a chance to sync first.
             
             // NOTE: We access the store state directly via hook in component for simplicity
             if (Object.keys(shapes).length === 0) {
                 console.log(" Loading saved board from MongoDB...");
                 const { shapes: savedShapes, connectors: savedConnectors } = dbData.data;
                 
                 // Restore Shapes
                 if (savedShapes) {
                    Object.values(savedShapes).forEach(shape => addShape(shape));
                 }
                 // Restore Connectors
                 if (savedConnectors) {
                    Object.values(savedConnectors).forEach(conn => addConnector(conn));
                 }
             } else {
                 console.log(" Connected to live session (skipping DB load).");
             }
          }
        } catch (error) {
          console.error(" Failed to load board from cloud:", error);
        }
      };

      // Wait 1 second to let WebSocket sync first, then check DB
      const timer = setTimeout(loadFromCloud, 1000);
      return () => clearTimeout(timer);
    }
  }, [roomId, syncWithYjs]); // Run only when Room ID changes

  // --- 2. UPDATE CSS GRID ---
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