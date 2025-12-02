import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

export const doc = new Y.Doc();
export const yShapes = doc.getMap('shapes');
export const yConnectors = doc.getMap('connectors');

export let provider = null;
export let awareness = null;
export let persistence = null;

export const connectToRoom = (roomId) => {
  if (provider && provider.roomname === roomId) return;
  if (provider) {
    provider.destroy();
    if (persistence) persistence.destroy();
  }

  // YOUR CLOUD SERVER URL
  const SERVER_URL = 'wss://glorious-succotash-wrg7466vjpx629599-1234.app.github.dev'; 

  provider = new WebsocketProvider(SERVER_URL, roomId, doc);
  persistence = new IndexeddbPersistence(`holoboard-${roomId}`, doc);
  awareness = provider.awareness;

  return provider;
};