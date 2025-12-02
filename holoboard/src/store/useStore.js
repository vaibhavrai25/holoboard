import { create } from 'zustand';
import * as Y from 'yjs';
import { connectToRoom, yShapes, yConnectors, doc } from '../services/collaboration';

const undoManager = new Y.UndoManager([yShapes, yConnectors]);

const useStore = create((set, get) => ({
  // ... (Keep existing state: selectedId, mode, stage, theme, settings...) ...
  selectedId: null,
  mode: 'select', 
  connectingFromId: null,
  stage: { scale: 1, x: 0, y: 0 },
  theme: 'dark',
  gridColor: 'rgba(255, 255, 255, 0.05)',
  isSnapEnabled: true,
  penColor: '#df4b26',
  penWidth: 3,

  shapes: {}, 
  connectors: {},

  // ... (Keep existing actions: addShape, updateShape, addConnector, deleteSelected...) ...
  addShape: (newShape) => yShapes.set(newShape.id, newShape),
  updateShape: (id, newAttrs) => {
    const shape = yShapes.get(id);
    if (shape) yShapes.set(id, { ...shape, ...newAttrs });
  },
  addConnector: (newConnector) => yConnectors.set(newConnector.id, newConnector),
  deleteSelected: () => {
    const { selectedId } = get();
    if (!selectedId) return;
    doc.transact(() => {
        yShapes.delete(selectedId);
        yConnectors.forEach((conn, key) => {
            if (conn.from === selectedId || conn.to === selectedId) yConnectors.delete(key);
        });
    });
    set({ selectedId: null });
  },

  // --- NEW ACTION: RESET BOARD ---
  resetBoard: () => {
    doc.transact(() => {
        yShapes.clear();     // Delete all shapes
        yConnectors.clear(); // Delete all connections
    });
    set({ selectedId: null });
  },
  // -------------------------------

  undo: () => undoManager.undo(),
  redo: () => undoManager.redo(),

  // ... (Keep local actions: selectShape, setMode, setStage, toggleTheme...) ...
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
  toggleSnap: () => set((state) => ({ isSnapEnabled: !state.isSnapEnabled })),
  setPenColor: (color) => set({ penColor: color }),
  setPenWidth: (width) => set({ penWidth: width }),

  syncWithYjs: (roomId) => {
    connectToRoom(roomId);
    set({ shapes: yShapes.toJSON(), connectors: yConnectors.toJSON() });
    yShapes.observe(() => set({ shapes: yShapes.toJSON() }));
    yConnectors.observe(() => set({ connectors: yConnectors.toJSON() }));
  }
}));

export default useStore;