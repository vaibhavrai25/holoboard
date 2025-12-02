import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';

import { 
  LuMousePointer2, LuLink, LuPencil, LuEraser, LuUndo2, LuRedo2, LuPlus, 
  LuMagnet, LuLayoutGrid, LuLayoutTemplate, LuBot, LuTrash2,
  LuSquare, LuCircle, LuDiamond, LuStickyNote, LuImage,
  LuTriangle, LuHexagon, LuStar, LuCloud, LuDatabase, LuMessageSquare, 
  LuArrowRight, LuCircleDashed, LuBox, LuOctagon,
  LuChevronLeft, LuChevronRight
} from 'react-icons/lu';

const Toolbar = () => {
  const addShape = useStore((state) => state.addShape);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  
  const isSnapEnabled = useStore((state) => state.isSnapEnabled);
  const toggleSnap = useStore((state) => state.toggleSnap);
  const gridColor = useStore((state) => state.gridColor);
  const setGridColor = useStore((state) => state.setGridColor);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const penColor = useStore((state) => state.penColor);
  const setPenColor = useStore((state) => state.setPenColor);
  const penWidth = useStore((state) => state.penWidth);
  const setPenWidth = useStore((state) => state.setPenWidth);
  const resetBoard = useStore((state) => state.resetBoard);

  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const fileInputRef = useRef(null);

  const toggleShapeMenu = () => { if (showShapeMenu) setShowShapeMenu(false); else { setShowShapeMenu(true); setShowGridMenu(false); } };
  const toggleGridMenu = () => { if (showGridMenu) setShowGridMenu(false); else { setShowGridMenu(true); setShowShapeMenu(false); } };
  const togglePencil = () => { if (mode === 'pencil' || mode === 'eraser') { setMode('select'); } else { setMode('pencil'); setShowShapeMenu(false); setShowGridMenu(false); } };

  const handleAdd = (type) => {
    const id = uuidv4();
    let defaultFill = '#ff6b6b'; let defaultText = "Label"; let width = 100; let height = 100;
    
    // Custom defaults
    if (['circle','ellipse','ring'].includes(type)) defaultFill = '#4ecdc4';
    if (['diamond','triangle','star'].includes(type)) { defaultFill = '#ffe66d'; defaultText = "Step"; }
    if (type === 'sticky') { defaultFill = '#fff740'; defaultText = "Note"; width = 150; height = 150; }
    if (['cloud','speech'].includes(type)) defaultFill = '#a855f7';
    if (type === 'database') defaultFill = '#6366f1';

    addShape({ id, type, x: window.innerWidth/2-50, y: window.innerHeight/2-50, text: defaultText, fill: defaultFill, width, height });
    setMode('select'); setShowShapeMenu(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => { addShape({ id: uuidv4(), type: 'image', src: reader.result, x: window.innerWidth/2-100, y: window.innerHeight/2-75, width: 200, height: 150 }); };
        reader.readAsDataURL(file);
    }
    e.target.value = null; setShowShapeMenu(false);
  };

  const handleConfirmReset = () => { resetBoard(); setShowResetConfirm(false); };
  const triggerAutoLayout = () => window.dispatchEvent(new CustomEvent('auto-layout'));
  const triggerAI = () => window.dispatchEvent(new CustomEvent('trigger-ai'));

  const gridColors = ['#ff0000', '#00ff00', '#0000ff', '#aaaaaa', 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.1)'];
  const penColors = ['#df4b26', '#1a1a1a', '#ffffff', '#4ecdc4', '#ff6b6b', '#ffe66d', '#6366f1'];

  return (
    <div style={{ ...styles.wrapper, transform: isOpen ? 'translateX(0)' : 'translateX(-120%)' }}>
        <button onClick={() => setIsOpen(!isOpen)} style={styles.toggleBtn}>
            {isOpen ? <LuChevronLeft size={20} /> : <LuChevronRight size={20} />}
        </button>

        <div className="panel-base" style={styles.toolbar}>
        {/* Tools */}
        <button className="icon-button" style={{...styles.btn, background: mode === 'select' ? 'var(--button-hover)' : ''}} onClick={() => setMode('select')} title="Select"><LuMousePointer2 size={20} /></button>
        <button className="icon-button" style={{...styles.btn, background: mode === 'connect' ? 'var(--button-hover)' : ''}} onClick={() => setMode('connect')} title="Connect"><LuLink size={20} /></button>
        
        {/* Pencil */}
        <div style={{position: 'relative'}}>
            <button className="icon-button" style={{...styles.btn, background: (mode === 'pencil' || mode === 'eraser') ? 'var(--button-hover)' : ''}} onClick={togglePencil}><LuPencil size={20} /></button>
            {(mode === 'pencil' || mode === 'eraser') && (
                <div className="panel-base" style={styles.pencilMenu}>
                    <div style={{display:'flex', gap: 5, marginBottom: 10}}>
                        <button className="icon-button" onClick={() => setMode('pencil')} style={{flex:1, background: mode === 'pencil' ? '#6366f1' : '#333'}}><LuPencil size={16} /></button>
                        <button className="icon-button" onClick={() => setMode('eraser')} style={{flex:1, background: mode === 'eraser' ? '#6366f1' : '#333'}}><LuEraser size={16} /></button>
                    </div>
                    <div style={{marginBottom: 10}}>
                        <label style={{fontSize: 10, color:'#aaa'}}>Size: {penWidth}px</label>
                        <input type="range" min="1" max="50" value={penWidth} onChange={(e) => setPenWidth(parseInt(e.target.value))} style={{width: '100%'}} />
                    </div>
                    {mode === 'pencil' && (
                        <div style={styles.grid}>
                            {penColors.map(c => (<div key={c} onClick={() => setPenColor(c)} style={{...styles.swatch, background: c, border: penColor === c ? '2px solid white' : '1px solid #555'}} />))}
                        </div>
                    )}
                </div>
            )}
        </div>

        <div style={styles.divider}></div>
        <div style={{display: 'flex', gap: 4}}>
            <button className="icon-button" style={{...styles.btn, height: 35}} onClick={undo}><LuUndo2 size={18} /></button>
            <button className="icon-button" style={{...styles.btn, height: 35}} onClick={redo}><LuRedo2 size={18} /></button>
        </div>
        <div style={styles.divider}></div>

        {/* SHAPE MENU - EXPANDED */}
        <div style={{ position: 'relative' }}>
            <button className="icon-button" style={{...styles.btn, background: showShapeMenu ? 'var(--button-hover)' : ''}} onClick={toggleShapeMenu}><LuPlus size={24} /></button>
            {showShapeMenu && (
                <div className="panel-base" style={styles.megaMenu}>
                    <button className="icon-button" onClick={() => handleAdd('rect')} style={styles.menuBtn} title="Rectangle"><LuSquare /></button>
                    <button className="icon-button" onClick={() => handleAdd('circle')} style={styles.menuBtn} title="Circle"><LuCircle /></button>
                    <button className="icon-button" onClick={() => handleAdd('diamond')} style={styles.menuBtn} title="Diamond"><LuDiamond /></button>
                    <button className="icon-button" onClick={() => handleAdd('triangle')} style={styles.menuBtn} title="Triangle"><LuTriangle /></button>
                    <button className="icon-button" onClick={() => handleAdd('hexagon')} style={styles.menuBtn} title="Hexagon"><LuHexagon /></button>
                    <button className="icon-button" onClick={() => handleAdd('star')} style={styles.menuBtn} title="Star"><LuStar /></button>
                    <button className="icon-button" onClick={() => handleAdd('cloud')} style={styles.menuBtn} title="Cloud"><LuCloud /></button>
                    <button className="icon-button" onClick={() => handleAdd('database')} style={styles.menuBtn} title="Database"><LuDatabase /></button>
                    <button className="icon-button" onClick={() => handleAdd('speech')} style={styles.menuBtn} title="Speech"><LuMessageSquare /></button>
                    <button className="icon-button" onClick={() => handleAdd('arrowRight')} style={styles.menuBtn} title="Arrow"><LuArrowRight /></button>
                    <button className="icon-button" onClick={() => handleAdd('ring')} style={styles.menuBtn} title="Ring"><LuCircleDashed /></button>
                    <button className="icon-button" onClick={() => handleAdd('cube')} style={styles.menuBtn} title="Cube"><LuBox /></button>
                    <button className="icon-button" onClick={() => handleAdd('sticky')} style={styles.menuBtn} title="Sticky Note"><LuStickyNote color="#fff740" /></button>
                    <button className="icon-button" onClick={() => fileInputRef.current.click()} style={styles.menuBtn} title="Image"><LuImage /></button>
                </div>
            )}
        </div>
        <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleImageUpload} />

        <div style={styles.divider}></div>
        <button className="icon-button" style={{...styles.btn, color: isSnapEnabled ? '#4ecdc4' : 'var(--text-color)'}} onClick={toggleSnap}><LuMagnet size={20} /></button>
        <div style={{ position: 'relative' }}>
            <button className="icon-button" style={{...styles.btn, background: showGridMenu ? 'var(--button-hover)' : ''}} onClick={toggleGridMenu}><LuLayoutGrid size={20} /></button>
            {showGridMenu && (
                <div className="panel-base" style={{...styles.menu, gridTemplateColumns: 'repeat(3, 1fr)', width: '100px'}}>
                    {gridColors.map(c => (<div key={c} onClick={() => setGridColor(c)} style={{...styles.swatch, backgroundColor: c, border: gridColor === c ? '2px solid white' : '1px solid var(--button-border)'}} />))}
                </div>
            )}
        </div>

        <div style={styles.divider}></div>
        <button className="icon-button" onClick={triggerAutoLayout} style={{...styles.btn, color:'#4ecdc4', borderColor: '#4ecdc4'}}><LuLayoutTemplate size={20} /></button>
        <button className="icon-button" onClick={triggerAI} style={{...styles.btn, color:'#a855f7', borderColor: '#a855f7'}}><LuBot size={20} /></button>
        
        <div style={styles.divider}></div>
        <div style={{position: 'relative'}}>
            <button className="icon-button" style={{...styles.btn, color:'#fa5252', borderColor: '#fa5252'}} onClick={() => setShowResetConfirm(true)}><LuTrash2 size={20} /></button>
            {showResetConfirm && (
                <div className="panel-base" style={styles.confirmModal}>
                    <div style={{fontWeight:'bold', marginBottom:8, color:'#fa5252'}}>Clear All?</div>
                    <div style={{display:'flex', gap:8}}>
                        <button className="icon-button" onClick={() => setShowResetConfirm(false)} style={{fontSize:12, padding:'6px 10px'}}>Cancel</button>
                        <button className="icon-button" onClick={handleConfirmReset} style={{fontSize:12, padding:'6px 10px', background:'#fa5252', borderColor:'#fa5252', color:'white'}}>Clear</button>
                    </div>
                </div>
            )}
        </div>
        </div>
    </div>
  );
};

const styles = {
  wrapper: { position: 'fixed', top: '50%', left: '20px', transformOrigin: 'left center', marginTop: '-300px', zIndex: 100, transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' },
  toggleBtn: { position: 'absolute', right: '-24px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '48px', background: 'var(--toolbar-bg)', border: '1px solid var(--toolbar-border)', borderLeft: 'none', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 0 10px rgba(0,0,0,0.1)' },
  toolbar: { padding: '12px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
  btn: { width: '44px', height: '44px', fontSize: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  divider: { height: '1px', background: 'var(--toolbar-border)', margin: '4px 0' },
  menu: { position: 'absolute', left: '60px', top: 0, padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', width: '130px', zIndex: 101 },
  megaMenu: { position: 'absolute', left: '60px', top: '-100px', padding: '8px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', width: '150px', zIndex: 101 }, // Grid for many shapes
  pencilMenu: { position: 'absolute', left: '60px', top: '-60px', padding: '12px', borderRadius: '12px', width: '180px', zIndex: 102 },
  confirmModal: { position: 'absolute', left: '60px', bottom: 0, padding: '16px', borderRadius: '12px', width: '160px', zIndex: 102 },
  menuBtn: { width: '100%', height:'40px', justifyContent:'center', fontSize: '14px', padding: '8px', display: 'flex', alignItems: 'center' },
  swatch: { width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }
};

export default Toolbar;