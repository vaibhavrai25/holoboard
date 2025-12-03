import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';
import {
  LuMousePointer2, LuLink, LuPencil, LuEraser, LuUndo2, LuRedo2, LuPlus,
  LuMagnet, LuLayoutGrid, LuLayoutTemplate, LuBot, LuTrash2,
  LuSquare, LuCircle, LuDiamond, LuStickyNote, LuImage,
  LuTriangle, LuHexagon, LuStar, LuCloud, LuDatabase, LuMessageSquare,
  LuArrowRight, LuCircleDashed, LuBox,
  LuChevronLeft, LuChevronRight, LuSparkles, LuX, LuMoveRight 
} from 'react-icons/lu';

// --- CONFIGURATION ---
// ⚠️ ENSURE THIS MATCHES YOUR PORT 3000 PUBLIC URL
const AI_API_URL = 'https://glorious-succotash-wrg7466vjpx629599-3000.app.github.dev/generate';

const GRID_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#aaaaaa', 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.1)'];
const PEN_COLORS = ['#df4b26', '#1a1a1a', '#ffffff', '#4ecdc4', '#ff6b6b', '#ffe66d', '#6366f1'];

const SHAPE_DEFAULTS = {
  default: { fill: '#ff6b6b', text: 'Label', width: 100, height: 100 },
  teal: { fill: '#4ecdc4', text: 'Label', width: 100, height: 100 },
  yellow: { fill: '#ffe66d', text: 'Step', width: 100, height: 100 },
  purple: { fill: '#a855f7', text: 'Label', width: 100, height: 100 },
  indigo: { fill: '#6366f1', text: 'Label', width: 100, height: 100 },
  sticky: { fill: '#fff740', text: 'Note', width: 150, height: 150 },
  arrow: { fill: '#333', text: 'Label', width: 100, height: 20 }
};

const SHAPE_TYPES = {
  rect: 'default', circle: 'teal', ellipse: 'teal', ring: 'teal',
  diamond: 'yellow', triangle: 'yellow', star: 'yellow',
  cloud: 'purple', speech: 'purple', database: 'indigo', sticky: 'sticky', arrowshape: 'default'
};

const SHAPE_ICONS = {
  rect: <LuSquare />, circle: <LuCircle />, ellipse: <LuCircle style={{transform: 'scaleX(1.2)'}} />,
  ring: <LuCircleDashed />, diamond: <LuDiamond />, triangle: <LuTriangle />,
  star: <LuStar />, cloud: <LuCloud />, speech: <LuMessageSquare />,
  database: <LuDatabase />, sticky: <LuStickyNote />,
  arrowshape: <LuMoveRight />
};

const Toolbar = () => {
  const addShape = useStore((state) => state.addShape);
  const addConnector = useStore((state) => state.addConnector);
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


  const [activeMenu, setActiveMenu] = useState(null); 
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // --- NEW: Error State for AI ---
  const [aiError, setAiError] = useState(''); 

  const fileInputRef = useRef(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    if (menuName === 'ai') {
        setAiPrompt('');
        setAiError(''); // Clear errors when opening
    }
  };

  const togglePencilMode = () => {
    if (mode === 'pencil' || mode === 'eraser') { setMode('select'); setActiveMenu(null); } 
    else { setMode('pencil'); setActiveMenu('pencil'); }
  };

  const handleAddShape = (type) => {
    const id = uuidv4();
    const configKey = SHAPE_TYPES[type] || 'default';
    const { fill, text, width, height } = SHAPE_DEFAULTS[configKey];
    addShape({ id, type, x: window.innerWidth/2-50, y: window.innerHeight/2-50, text, fill, width, height });
    setMode('select'); setActiveMenu(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        addShape({ id: uuidv4(), type: 'image', src: reader.result, x: window.innerWidth/2-100, y: window.innerHeight/2-75, width: 200, height: 150 });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null; setActiveMenu(null);
  };

  const handleConfirmReset = () => { resetBoard(); setActiveMenu(null); };
  const triggerAutoLayout = () => window.dispatchEvent(new CustomEvent('auto-layout'));

  // --- 🪄 IMPROVED AI HANDLER ---
  const handleMagic = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsLoading(true);
    setAiError(''); // Clear previous errors
    document.body.style.cursor = 'wait';

    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      // Handle HTTP errors (like 500 or 404)
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Success Logic
      if (data.shapes) {
        const cx = window.innerWidth/2 - 200; 
        const cy = window.innerHeight/2 - 100;
        data.shapes.forEach(s => addShape({ ...s, id: s.id || uuidv4(), x: (s.x||0)+cx, y: (s.y||0)+cy, width: s.type==='sticky'?150:100, height: s.type==='sticky'?150:100 }));
      }
      if (data.connectors) {
        data.connectors.forEach(c => addConnector({ id: uuidv4(), from: c.from, to: c.to }));
      }
      
      setTimeout(triggerAutoLayout, 200);
      setActiveMenu(null); // Close only on success

    } catch (error) {
      console.error(error);
      // SHOW ERROR IN UI, NOT ALERT
      setAiError("Generation failed. Check server console."); 
    } finally {
      setIsLoading(false);
      document.body.style.cursor = 'default';
    }
  };

  const IconButton = ({ onClick, isActive, color, title, children, style, disabled }) => (
    <button className="icon-button" style={{ ...styles.btn, background: isActive ? 'var(--button-hover)' : undefined, color: color, borderColor: color, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'wait' : 'pointer', ...style }} onClick={onClick} title={title} disabled={disabled}>{children}</button>
  );

  return (
    <div style={{ ...styles.wrapper, transform: isOpen ? 'translateX(0)' : 'translateX(-120%)' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.toggleBtn}>{isOpen ? <LuChevronLeft size={20} /> : <LuChevronRight size={20} />}</button>

      <div className="panel-base" style={styles.toolbar}>
        <IconButton isActive={mode === 'select'} onClick={() => setMode('select')} title="Select"><LuMousePointer2 size={20} /></IconButton>
        <IconButton isActive={mode === 'connect'} onClick={() => setMode('connect')} title="Connect"><LuLink size={20} /></IconButton>

        <div style={{ position: 'relative' }}>
          <IconButton isActive={mode === 'pencil' || mode === 'eraser'} onClick={togglePencilMode} title="Pencil"><LuPencil size={20} /></IconButton>
          {(mode === 'pencil' || mode === 'eraser') && (
            <div className="panel-base" style={styles.pencilMenu}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                <IconButton isActive={mode === 'pencil'} onClick={() => setMode('pencil')} style={{ flex: 1 }}><LuPencil size={16} /></IconButton>
                <IconButton isActive={mode === 'eraser'} onClick={() => setMode('eraser')} style={{ flex: 1 }}><LuEraser size={16} /></IconButton>
              </div>
              <div style={{ marginBottom: 10 }}><label style={{ fontSize: 10, color: '#aaa' }}>Size: {penWidth}px</label><input type="range" min="1" max="50" value={penWidth} onChange={(e) => setPenWidth(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
              {mode === 'pencil' && (<div style={styles.grid}>{PEN_COLORS.map(c => (<div key={c} onClick={() => setPenColor(c)} style={{ ...styles.swatch, background: c, border: penColor === c ? '2px solid white' : '1px solid #555' }} />))}</div>)}
            </div>
          )}
        </div>

        <div style={styles.divider}></div>
        <div style={{ display: 'flex', gap: 4 }}><IconButton onClick={undo} style={{ height: 35 }}><LuUndo2 size={18} /></IconButton><IconButton onClick={redo} style={{ height: 35 }}><LuRedo2 size={18} /></IconButton></div>
        <div style={styles.divider}></div>

        <div style={{ position: 'relative' }}>
          <IconButton isActive={activeMenu === 'shape'} onClick={() => toggleMenu('shape')}><LuPlus size={24} /></IconButton>
          {activeMenu === 'shape' && (
            <div className="panel-base" style={styles.megaMenu}>
              {Object.keys(SHAPE_TYPES).map(type => (<IconButton key={type} onClick={() => handleAddShape(type)} title={type}>{SHAPE_ICONS[type] || <LuBox />}</IconButton>))}
              <IconButton onClick={() => fileInputRef.current.click()} title="Image"><LuImage /></IconButton>
              <IconButton onClick={() => handleAdd('arrowshape')} title="Free Arrow"><LuMoveRight /></IconButton>
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />

        <div style={styles.divider}></div>
        <IconButton color={isSnapEnabled ? '#4ecdc4' : 'var(--text-color)'} onClick={toggleSnap}><LuMagnet size={20} /></IconButton>
        
        <div style={{ position: 'relative' }}>
          <IconButton isActive={activeMenu === 'grid'} onClick={() => toggleMenu('grid')}><LuLayoutGrid size={20} /></IconButton>
          {activeMenu === 'grid' && (<div className="panel-base" style={{ ...styles.menu, gridTemplateColumns: 'repeat(3, 1fr)', width: '100px' }}>{GRID_COLORS.map(c => (<div key={c} onClick={() => setGridColor(c)} style={{ ...styles.swatch, backgroundColor: c, border: gridColor === c ? '2px solid white' : '1px solid var(--button-border)' }} />))}</div>)}
        </div>

        <div style={styles.divider}></div>
        <IconButton color="#4ecdc4" onClick={triggerAutoLayout} title="Auto-Layout"><LuLayoutTemplate size={20} /></IconButton>
        
        {/* --- AI SECTION --- */}
        <div style={{ position: 'relative' }}>
            <IconButton color="#a855f7" isActive={activeMenu === 'ai'} onClick={() => toggleMenu('ai')} title="AI Magic"><LuBot size={20} /></IconButton>
            {activeMenu === 'ai' && (
                <div className="panel-base" style={styles.aiMenu}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                        <span style={{fontWeight:'bold', color:'#a855f7', display:'flex', alignItems:'center', gap:5}}><LuSparkles /> AI Generate</span>
                        <LuX style={{cursor:'pointer'}} onClick={() => setActiveMenu(null)} />
                    </div>
                    
                    <textarea style={styles.aiInput} placeholder="e.g. Login flow" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} autoFocus />
                    
                    {/* ERROR MESSAGE DISPLAY */}
                    {aiError && (
                        <div style={{color: '#fa5252', fontSize: '11px', marginTop: '5px', display:'flex', alignItems:'center', gap:4}}>
                            <LuX size={12} /> {aiError}
                        </div>
                    )}

                    <button style={{...styles.aiBtn, opacity: isLoading||!aiPrompt?0.6:1, cursor: isLoading?'wait':'pointer'}} onClick={handleMagic} disabled={isLoading||!aiPrompt}>
                        {isLoading ? 'Dreaming...' : 'Generate'}
                    </button>
                </div>
            )}
        </div>

        <div style={styles.divider}></div>
        <div style={{ position: 'relative' }}>
          <IconButton color="#fa5252" onClick={() => toggleMenu('reset')}><LuTrash2 size={20} /></IconButton>
          {activeMenu === 'reset' && (
            <div className="panel-base" style={styles.confirmModal}>
              <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#fa5252' }}>Clear All?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="icon-button" onClick={() => setActiveMenu(null)} style={{ fontSize: 12, padding: '6px 10px' }}>Cancel</button>
                <button className="icon-button" onClick={handleConfirmReset} style={{ fontSize: 12, padding: '6px 10px', background: '#fa5252', borderColor: '#fa5252', color: 'white' }}>Clear</button>
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
  toolbar: { padding: '12px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  btn: { width: '44px', height: '44px', fontSize: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  divider: { height: '1px', background: 'var(--toolbar-border)', margin: '4px 0' },
  menu: { position: 'absolute', left: '60px', top: 0, padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', width: '130px', zIndex: 101 },
  megaMenu: { position: 'absolute', left: '60px', top: '-100px', padding: '8px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', width: '150px', zIndex: 101 },
  pencilMenu: { position: 'absolute', left: '60px', top: '-60px', padding: '12px', borderRadius: '12px', width: '180px', zIndex: 102 },
  confirmModal: { position: 'absolute', left: '60px', bottom: 0, padding: '16px', borderRadius: '12px', width: '160px', zIndex: 102 },
  swatch: { width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' },
  aiMenu: { position: 'absolute', left: '60px', bottom: 0, width: '260px', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 102, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  aiInput: { width: '100%', height: '80px', padding: '10px', background: 'var(--bg-color)', border: '1px solid var(--button-border)', borderRadius: '8px', color: 'var(--text-color)', resize: 'none', outline: 'none', fontSize: '13px', fontFamily: 'inherit' },
  aiBtn: { background: '#a855f7', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s', marginTop: '5px' }
};

export default Toolbar;