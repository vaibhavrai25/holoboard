import React from 'react';
import useStore from '../store/useStore';
import { UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  
  // Trigger export event (listened to by StageWrapper)
  const triggerExport = () => window.dispatchEvent(new CustomEvent('export-image'));

  return (
    <div className="panel-base" style={styles.navbar}>
      {/* Left Side */}
      <div style={styles.left}>
        <span style={{fontSize: '24px'}}>🛸</span>
        <h1 style={styles.title}>Holoboard Designer</h1>
      </div>

      {/* Right Side */}
      <div style={styles.right}>
        <button onClick={toggleTheme} className="icon-button" style={styles.button} title="Toggle Theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={triggerExport} className="icon-button" style={{...styles.button, borderColor:'#ffeb3b', color:'#ffeb3b'}} title="Export Image">
          📷 Export
        </button>
        
        {/* REAL USER PROFILE BUTTON */}
        <div style={{marginLeft: '10px'}}>
            <UserButton afterSignOutUrl="/" /> 
        </div>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 200,
    borderRadius: 0, // Override panel-base border radius
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    boxSizing: 'border-box',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { margin: 0, fontSize: '18px', fontWeight: 600 },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  button: { padding: '8px 12px', fontSize: '14px', fontWeight: 600, gap: '8px' },
  shareBtn: {
    background: '#646cff',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
  },
  profile: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #ff6b6b, #f06595)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: 'white',
    cursor: 'pointer',
    border: '2px solid white',
  }
};

export default Navbar;