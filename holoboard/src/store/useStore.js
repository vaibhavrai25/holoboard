import { create } from 'zustand';
import * as Y from 'yjs';
import { connectToRoom, yShapes, yConnectors, doc } from '../services/collaboration';

const undoManager = new Y.UndoManager([yShapes, yConnectors]);

const useStore = create((set, get) => ({

  /* ────────────────────────────────────────────
   * UI / META STATE
   * ────────────────────────────────────────────
   */
  selectedId: null,
  mode: 'select',              // select | edit | connect | draw | text
  connectingFromId: null,

  stage: { scale: 1, x: 0, y: 0 },   // Camera / viewport

  theme: 'dark',
  gridColor: 'rgba(255, 255, 255, 0.05)',

  boardName: "Untitled Board",

  /* ────────────────────────────────────────────
   * Settings
   * ────────────────────────────────────────────
   */
  isSnapEnabled: true,
  penColor: '#df4b26',
  penWidth: 3,

  /* ────────────────────────────────────────────
   * SHARED DOCUMENT STATE (Y.js)
   * ────────────────────────────────────────────
   */
  shapes: {},
  connectors: {},

  /* ────────────────────────────────────────────
   * ACTIONS
   * ────────────────────────────────────────────
   */

  setBoardName: (name) => set({ boardName: name }),

  /* SHAPES */
  addShape: (shape) => yShapes.set(shape.id, shape),

  updateShape: (id, newAttrs) => {
    const oldShape = yShapes.get(id);
    if (!oldShape) return;
    yShapes.set(id, { ...oldShape, ...newAttrs });
  },

  /* CONNECTORS */
  addConnector: (conn) => yConnectors.set(conn.id, conn),

  updateConnector: (id, partial) => {
    const old = yConnectors.get(id);
    if (!old) return;
    yConnectors.set(id, { ...old, ...partial });
  },

  deleteSelected: () => {
    const id = get().selectedId;
    if (!id) return;

    doc.transact(() => {
      yShapes.delete(id);

      // Remove linked connectors
      yConnectors.forEach((conn, key) => {
        if (conn.from === id || conn.to === id) {
          yConnectors.delete(key);
        }
      });
    });

    set({ selectedId: null });
  },

  undo: () => undoManager.undo(),
  redo: () => undoManager.redo(),

  selectShape: (id) => set({ selectedId: id }),

  setMode: (mode) =>
    set({ mode, connectingFromId: null, selectedId: null }),

  setConnectingFrom: (id) => set({ connectingFromId: id }),

  /* CAMERA / STAGE */
  setStage: (partial) =>
    set((state) => ({
      stage: { ...state.stage, ...partial }
    })),

  /* THEME */
  toggleTheme: () =>
    set((state) => {
      const dark = state.theme === "light";
      return {
        theme: dark ? "dark" : "light",
        gridColor: dark
          ? "rgba(255,255,255,0.05)"
          : "rgba(0,0,0,0.05)"
      };
    }),

  setGridColor: (color) => set({ gridColor: color }),

  toggleSnap: () =>
    set((s) => ({ isSnapEnabled: !s.isSnapEnabled })),

  setPenColor: (color) => set({ penColor: color }),
  setPenWidth: (width) => set({ penWidth: width }),

  /* ────────────────────────────────────────────
   * Y.js SYNC — FIXED FOR NO INFINITE LOOPS
   * ────────────────────────────────────────────
   */
  syncWithYjs: (roomId) => {
    connectToRoom(roomId);

    // Initial load
    set({
      shapes: yShapes.toJSON(),
      connectors: yConnectors.toJSON(),
    });

    // SHAPES listener (stable)
    yShapes.observe(() => {
      const newShapes = yShapes.toJSON();
      const oldShapes = get().shapes;

      // Avoid infinite render loop
      if (JSON.stringify(newShapes) !== JSON.stringify(oldShapes)) {
        set({ shapes: newShapes });
      }
    });

    // CONNECTORS listener (stable)
    yConnectors.observe(() => {
      const newConn = yConnectors.toJSON();
      const oldConn = get().connectors;

      // Avoid infinite update loop
      if (JSON.stringify(newConn) !== JSON.stringify(oldConn)) {
        set({ connectors: newConn });
      }
    });
  },

}));

export default useStore;
