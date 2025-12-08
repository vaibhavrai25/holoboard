import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

export const doc = new Y.Doc();
export const yShapes = doc.getMap("shapes");
export const yConnectors = doc.getMap("connectors");

export let provider = null;
export let awareness = null;
export let persistence = null;

export const connectToRoom = (roomId) => {
  
  if (provider && provider.roomName === roomId) return provider;

  // Destroy previous room connection
  if (provider) {
    provider.destroy();
    if (persistence) persistence.destroy();
  }

  //  You had trailing slash → causing same room issue  
  const SERVER_URL = "wss:glorious-succotash-wrg7466vjpx629599-1234.app.github.dev";

  provider = new WebsocketProvider(SERVER_URL, roomId, doc);
  awareness = provider.awareness;

  persistence = new IndexeddbPersistence(`holoboard-${roomId}`, doc);

  return provider;
};
