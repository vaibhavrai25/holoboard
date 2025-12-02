import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

// 1. Create the shared document
export const doc = new Y.Doc();

// 2. Connect to your local server (running on port 1234)
export const provider = new WebsocketProvider(
  'http://127.0.0.1:5173', 
  'holoboard-room', // Room name
  doc
);

// 3. Save data to browser database (so it works offline/reload)
export const persistence = new IndexeddbPersistence('holoboard-data', doc);

// 4. Export shared data types
export const yShapes = doc.getMap('shapes');
export const yConnectors = doc.getMap('connectors');

// 5. Export awareness (for cursors)
export const awareness = provider.awareness;