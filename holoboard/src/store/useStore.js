import { create } from 'zustand';
import { yShapes, yConnectors, doc } from '../services/collaboration';

const useStore = create((set, get) => ({
  // --- UI STATE (Local only) ---
  selectedId: null,
  mode: 'select',
  connectingFromId: null,
  stage: { scale: 1, x: 0, y: 0 },
  theme: 'dark',
  gridColor: 'rgba(255, 255, 255, 0.05)',

  // --- SHARED STATE (Synced) ---
  shapes: {}, 
  connectors: {},

  // --- ACTIONS (Write to Yjs) ---
  addShape: (newShape) => {
    yShapes.set(newShape.id, newShape); // Syncs automatically
  },

  updateShape: (id, newAttrs) => {
    const shape = yShapes.get(id);
    if (shape) {
      yShapes.set(id, { ...shape, ...newAttrs });
    }
  },

  addConnector: (newConnector) => {
    yConnectors.set(newConnector.id, newConnector);
  },

  deleteSelected: () => {
    const { selectedId } = get();
    if (!selectedId) return;
    
    doc.transact(() => {
        yShapes.delete(selectedId);
        // Clean up connected arrows
        yConnectors.forEach((conn, key) => {
            if (conn.from === selectedId || conn.to === selectedId) {
                yConnectors.delete(key);
            }
        });
    });
    set({ selectedId: null });
  },

  // --- LOCAL ACTIONS ---
  selectShape: (id) => set({ selectedId: id }),
  setMode: (mode) => set({ mode, connectingFromId: null, selectedId: null }),
  setConnectingFrom: (id) => set({ connectingFromId: id }),
  setStage: (newStage) => set({ stage: newStage }),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    const newGridColor = newTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    return { theme: newTheme, gridColor: newGridColor };
  }),
  setGridColor: (color) => set({ gridColor: color }),

  // --- SYNC INITIALIZER ---
  syncWithYjs: () => {
    // 1. Load initial data
    set({ 
        shapes: yShapes.toJSON(), 
        connectors: yConnectors.toJSON() 
    });

    // 2. Listen for updates from Server
    yShapes.observe(() => {
        set({ shapes: yShapes.toJSON() });
    });
    yConnectors.observe(() => {
        set({ connectors: yConnectors.toJSON() });
    });
  }
}));

export default useStore;