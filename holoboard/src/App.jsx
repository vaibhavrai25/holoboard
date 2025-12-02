import React, { useEffect } from 'react'; // <-- Import useEffect
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Board from './pages/Board';
import useStore from './store/useStore'; // <-- Import Store

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key. Check .env.local");
}

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();
  const syncWithYjs = useStore((state) => state.syncWithYjs);

  // --- START SYNCING ON LOAD ---
  useEffect(() => {
    syncWithYjs();
  }, []);
  // -----------------------------

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      navigate={(to) => navigate(to)}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/board"
          element={
            <>
              <SignedIn>
                <Board />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ClerkProviderWithRoutes />
    </BrowserRouter>
  );
}

export default App;