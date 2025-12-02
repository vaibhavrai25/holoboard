import React from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { isSignedIn } = useUser();

  // If already logged in, go straight to the board
  if (isSignedIn) {
    return <Navigate to="/dashboard" />; // Changed from /board to /dashboard
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.badge}>✨ The Future of Whiteboarding</div>
        <h1 style={styles.title}>Holoboard Designer</h1>
        <p style={styles.subtitle}>
          Collaborate, Design, and layout your ideas in an infinite space. 
          Featuring auto-layout, sticky notes, and dark mode.
        </p>
        
        <div style={styles.buttons}>
          <SignInButton mode="modal">
            <button style={styles.loginBtn}>Log In</button>
          </SignInButton>
          
          <SignUpButton mode="modal">
            <button style={styles.signupBtn}>Sign Up Free</button>
          </SignUpButton>
        </div>
      </div>
      
      {/* Background Grid Animation Effect */}
      <div style={styles.gridBackground}></div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f13', // Deep dark theme
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  hero: {
    textAlign: 'center',
    zIndex: 10,
    maxWidth: '600px',
    padding: '20px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  title: {
    fontSize: '64px',
    margin: '0 0 20px 0',
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '800',
    letterSpacing: '-2px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#94a3b8',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  loginBtn: {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  signupBtn: {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    background: '#6366f1',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
    transition: 'all 0.2s',
  },
  gridBackground: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)', // Vignette effect
  }
};

export default Home;