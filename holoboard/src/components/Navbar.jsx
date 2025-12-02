import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import useStore from '../store/useStore';

const Navbar = () => {
  const { roomId } = useParams(); // Get Room ID from URL
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const [copied, setCopied] = useState(false);
  
  const triggerExport = () => window.dispatchEvent(new CustomEvent('export-image'));

  const copyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="panel-base" style={styles.navbar}>
      {/* Left Side */}
      <div style={styles.left}>
        <span style={{fontSize: '24px'}}>🛸</span>
        <h1 style={styles.title}>Holoboard</h1>
        
        {/* ROOM ID DISPLAY (Click to Copy) */}
        {roomId && (
          <div style={styles.roomBadge} onClick={copyRoomId} title="Click to copy Room ID">
            <span style={{opacity: 0.6}}>Room:</span>
            <span style={{fontWeight: 'bold', color: '#6366f1'}}>
              {roomId}
            </span>
            {copied ? (
              <span style={styles.copiedTag}>Copied! ✅</span>
            ) : (
              <span style={{opacity: 0.5, fontSize: '12px'}}>📋</span>
            )}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div style={styles.right}>
        <button onClick={toggleTheme} className="icon-button" style={styles.button} title="Toggle Theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={triggerExport} className="icon-button" style={{...styles.button, borderColor:'#ffeb3b', color:'#ffeb3b'}} title="Export Image">
          📷 Export
        </button>
        
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
    top: 0, left: 0, width: '100%', height: '60px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', zIndex: 200,
    borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none',
    boxSizing: 'border-box',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { margin: 0, fontSize: '18px', fontWeight: 600 },
  
  // Styles for Room Badge
  roomBadge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--bg-color)', 
    border: '1px solid var(--button-border)',
    padding: '6px 12px', borderRadius: '20px',
    fontSize: '14px', cursor: 'pointer',
    marginLeft: '20px', transition: 'all 0.2s',
  },
  copiedTag: { fontSize: '12px', color: '#4ecdc4', fontWeight: 'bold' },

  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  button: { padding: '8px 12px', fontSize: '14px', fontWeight: 600, gap: '8px' },
};

export default Navbar;