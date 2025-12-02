import React, { useState } from 'react';
import useStore from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';

const Toolbar = () => {
  const addShape = useStore((state) => state.addShape);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const gridColor = useStore((state) => state.gridColor);
  const setGridColor = useStore((state) => state.setGridColor);

  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);

  const handleAdd = (type) => {
    // ... (same as before)
    const id = uuidv4();
    let defaultFill = '#ff6b6b'; let defaultText = "Label"; let width = 100; let height = 100;
    if (type === 'circle') defaultFill = '#4ecdc4';
    if (type === 'diamond') { defaultFill = '#ffe66d'; defaultText = "Decision"; }
    if (type === 'sticky') { defaultFill = '#fff740'; defaultText = "Note"; width = 150; height = 150; }
    addShape({ id, type, x: window.innerWidth/2-50 + Math.random()*50, y: window.innerHeight/2-50 + Math.random()*50, text: defaultText, fill: defaultFill, width, height });
    setMode('select'); setShowShapeMenu(false);
  };

  const triggerAutoLayout = () => window.dispatchEvent(new CustomEvent('auto-layout'));

  const gridColors = ['#ff0000', '#00ff00', '#0000ff', '#aaaaaa', 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.1)'];

  return (
    <div className="panel-base" style={styles.toolbar}>
      {/* MODES */}
      <button className="icon-button" style={{...styles.btn, background: mode === 'select' ? 'var(--button-hover)' : ''}} onClick={() => setMode('select')} title="Select Tool">👆</button>
      <button className="icon-button" style={{...styles.btn, background: mode === 'connect' ? 'var(--button-hover)' : ''}} onClick={() => setMode('connect')} title="Connect Tool">🔗</button>
      <div style={styles.divider}></div>

      {/* ADD SHAPE DROPDOWN */}
      <div style={{ position: 'relative' }}>
        <button className="icon-button" style={styles.btn} onClick={() => setShowShapeMenu(!showShapeMenu)} title="Add Shape">➕</button>
        {showShapeMenu && (
            <div className="panel-base" style={styles.menu}>
                <button className="icon-button" onClick={() => handleAdd('rect')} style={styles.menuBtn}>⬜ Box</button>
                <button className="icon-button" onClick={() => handleAdd('circle')} style={styles.menuBtn}>⚪ Circle</button>
                <button className="icon-button" onClick={() => handleAdd('diamond')} style={styles.menuBtn}>◇ Decision</button>
                <button className="icon-button" onClick={() => handleAdd('sticky')} style={styles.menuBtn}>📝 Sticky</button>
            </div>
        )}
      </div>
      <div style={styles.divider}></div>

      {/* GRID COLOR DROPDOWN */}
      <div style={{ position: 'relative' }}>
        <button className="icon-button" style={styles.btn} onClick={() => setShowGridMenu(!showGridMenu)} title="Grid Color">🕸️</button>
        {showGridMenu && (
            <div className="panel-base" style={{...styles.menu, gridTemplateColumns: 'repeat(3, 1fr)', width: '100px'}}>
                {gridColors.map(c => (
                    <div key={c} onClick={() => setGridColor(c)} style={{...styles.swatch, backgroundColor: c, border: gridColor === c ? '2px solid white' : '1px solid var(--button-border)'}} />
                ))}
            </div>
        )}
      </div>

      {/* AUTO LAYOUT */}
      <button className="icon-button" onClick={triggerAutoLayout} style={{...styles.btn, color:'#4ecdc4', borderColor: '#4ecdc4'}} title="Auto Layout">✨</button>
    </div>
  );
};

const styles = {
  toolbar: {
    position: 'fixed', top: '50%', left: '20px', transform: 'translateY(-50%)',
    padding: '12px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100
  },
  btn: { width: '44px', height: '44px', fontSize: '20px' },
  divider: { height: '1px', background: 'var(--toolbar-border)', margin: '4px 0' },
  menu: {
    position: 'absolute', left: '60px', top: 0, padding: '8px', borderRadius: '8px',
    display: 'flex', flexDirection: 'column', gap: '8px', width: '130px', zIndex: 101
  },
  menuBtn: { width: '100%', justifyContent:'flex-start', fontSize: '14px', padding: '8px' },
  swatch: { width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }
};

export default Toolbar;