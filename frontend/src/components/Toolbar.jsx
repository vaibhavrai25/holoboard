import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';
import {
  LuMousePointer2, LuLink, LuPencil, LuEraser, LuUndo2, LuRedo2, LuPlus,
  LuMagnet, LuLayoutGrid, LuLayoutTemplate, LuBot, LuTrash2,
  LuSquare, LuCircle, LuDiamond, LuStickyNote, LuImage,
  LuTriangle, LuStar, LuCloud, LuDatabase, LuMessageSquare,
  LuMoveRight, LuCircleDashed, LuBox,
  LuChevronLeft, LuChevronRight, LuSparkles, LuX,
  LuActivity, LuMap, LuLightbulb 
} from 'react-icons/lu';


// --- TEMPLATES CONFIGURATION ---
const TEMPLATES = {
  ideaMultiplier: {
    shapes: [
      { id: 'center', type: 'rect', x: 400, y: 300, width: 160, height: 100, fill: '#ffeb3b', text: 'Main Idea' },
      { id: 'c1', type: 'circle', x: 200, y: 150, width: 100, height: 100, fill: '#ffffff', text: 'Aspect 1', stroke: '#ffeb3b' },
      { id: 'c2', type: 'circle', x: 600, y: 150, width: 100, height: 100, fill: '#ffffff', text: 'Aspect 2', stroke: '#ffeb3b' },
      { id: 'c3', type: 'circle', x: 200, y: 450, width: 100, height: 100, fill: '#ffffff', text: 'Aspect 3', stroke: '#ffeb3b' },
      { id: 'c4', type: 'circle', x: 600, y: 450, width: 100, height: 100, fill: '#ffffff', text: 'Aspect 4', stroke: '#ffeb3b' },
    ],
    connectors: [
      { from: 'center', to: 'c1' }, { from: 'center', to: 'c2' },
      { from: 'center', to: 'c3' }, { from: 'center', to: 'c4' },
    ]
  },
  flowchart: {
    shapes: [
      { id: 'start', type: 'circle', x: 100, y: 300, width: 80, height: 80, fill: '#4caf50', text: 'Start' },
      { id: 'step1', type: 'rect', x: 250, y: 290, width: 120, height: 100, fill: '#ffffff', text: 'Process', stroke: '#333' },
      { id: 'decide', type: 'diamond', x: 450, y: 290, width: 120, height: 120, fill: '#ffffff', text: 'Check?', stroke: '#2196f3' },
      { id: 'yes', type: 'rect', x: 650, y: 200, width: 120, height: 80, fill: '#ffffff', text: 'Approve', stroke: '#333' },
      { id: 'no', type: 'rect', x: 650, y: 400, width: 120, height: 80, fill: '#ffffff', text: 'Reject', stroke: '#333' },
    ],
    connectors: [
      { from: 'start', to: 'step1' }, { from: 'step1', to: 'decide' },
      { from: 'decide', to: 'yes' }, { from: 'decide', to: 'no' },
    ]
  },
  journeyMap: {
    shapes: [
      { id: 'h1', type: 'rect', x: 100, y: 100, width: 150, height: 60, fill: '#e0e0e0', text: 'Phase 1' },
      { id: 'h2', type: 'rect', x: 300, y: 100, width: 150, height: 60, fill: '#e0e0e0', text: 'Phase 2' },
      { id: 'h3', type: 'rect', x: 500, y: 100, width: 150, height: 60, fill: '#e0e0e0', text: 'Phase 3' },
      { id: 'n1', type: 'sticky', x: 110, y: 200, width: 130, height: 130, fill: '#fff9c4', text: 'User Action' },
      { id: 'n2', type: 'sticky', x: 310, y: 200, width: 130, height: 130, fill: '#ffcdd2', text: 'Pain Point' },
      { id: 'n3', type: 'sticky', x: 510, y: 200, width: 130, height: 130, fill: '#c8e6c9', text: 'Success' },
    ],
    connectors: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }
    ]
  }
};

const GRID_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#aaaaaa', 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.1)'];
const PEN_COLORS = ['#df4b26', '#1a1a1a', '#ffffff', '#4ecdc4', '#ff6b6b', '#ffe66d', '#6366f1'];

const SHAPE_DEFAULTS = {
  default: { fill: '#ff6b6b', text: 'Label', width: 100, height: 100 },
  teal: { fill: '#4ecdc4', text: 'Label', width: 100, height: 100 },
  yellow: { fill: '#ffe66d', text: 'Step', width: 100, height: 100 },
  purple: { fill: '#a855f7', text: 'Label', width: 100, height: 100 },
  indigo: { fill: '#6366f1', text: 'Label', width: 100, height: 100 },
  sticky: { fill: '#fff740', text: 'Note', width: 150, height: 150 },
  arrow: { fill: '#333333', text: '', width: 120, height: 60 } 
};

const SHAPE_TYPES = {
  rect: 'default', circle: 'teal', ellipse: 'teal', ring: 'teal',
  diamond: 'yellow', triangle: 'yellow', star: 'yellow',
  cloud: 'purple', speech: 'purple', database: 'indigo', 
  sticky: 'sticky', arrow: 'arrow'
};

const SHAPE_ICONS = {
  rect: <LuSquare />, circle: <LuCircle />, ellipse: <LuCircle style={{transform: 'scaleX(1.2)'}} />,
  ring: <LuCircleDashed />, diamond: <LuDiamond />, triangle: <LuTriangle />,
  star: <LuStar />, cloud: <LuCloud />, speech: <LuMessageSquare />,
  database: <LuDatabase />, sticky: <LuStickyNote />, arrow: <LuMoveRight />
};

const Toolbar = (props) => {
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
  const [aiError, setAiError] = useState(''); 

  const fileInputRef = useRef(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    if (menuName === 'ai') { setAiPrompt(''); setAiError(''); }
  };

  const togglePencilMode = () => {
    if (mode === 'pencil' || mode === 'eraser') { setMode('select'); setActiveMenu(null); } 
    else { setMode('pencil'); setActiveMenu('pencil'); }
  };

  const handleAddShape = (type) => {
    const id = uuidv4();
    const configKey = SHAPE_TYPES[type] || 'default';
    const { fill, text, width, height } = SHAPE_DEFAULTS[configKey];
    addShape({ id, type, x: window.innerWidth/2-50, y: window.innerHeight/2-50, text, fill, width, height, rotation: 0 });
    setMode('select'); setActiveMenu(null);
  };

  const handleTemplateLoad = (templateKey) => {
    const template = TEMPLATES[templateKey];
    if (!template) return;
    const idMap = {}; 
    const cx = window.innerWidth/2 - 400; 
    const cy = window.innerHeight/2 - 300;

    template.shapes.forEach(s => {
      const newId = uuidv4();
      idMap[s.id] = newId;
      addShape({
        ...s,
        id: newId,
        x: s.x + cx + (Math.random() * 20),
        y: s.y + cy + (Math.random() * 20)
      });
    });

    if (template.connectors) {
      template.connectors.forEach(c => {
        addConnector({
          id: uuidv4(),
          from: idMap[c.from],
          to: idMap[c.to]
        });
      });
    }
    setActiveMenu(null);
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

  const handleConfirmReset = () => { 
    resetBoard(); 
    setActiveMenu(null); 
  };

  const handleMagic = async () => { /* AI Logic Placeholder */ };

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

        {/* SHAPES MENU */}
        <div style={{ position: 'relative' }}>
          <IconButton isActive={activeMenu === 'shape'} onClick={() => toggleMenu('shape')}><LuPlus size={24} /></IconButton>
          {activeMenu === 'shape' && (
            <div className="panel-base" style={styles.megaMenu}>
              {Object.keys(SHAPE_TYPES).map(type => (
                <IconButton key={type} onClick={() => handleAddShape(type)} title={type}>{SHAPE_ICONS[type] || <LuBox />}</IconButton>
              ))}
              <IconButton onClick={() => fileInputRef.current.click()} title="Image"><LuImage /></IconButton>
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />

        <div style={styles.divider}></div>
        
        {/* SNAP TO GRID */}
        <IconButton isActive={isSnapEnabled} color={isSnapEnabled ? '#4ecdc4' : 'var(--text-color)'} onClick={toggleSnap} title="Toggle Snap"><LuMagnet size={20} /></IconButton>
        
        {/* GRID COLOR */}
        <div style={{ position: 'relative' }}>
          <IconButton isActive={activeMenu === 'grid'} onClick={() => toggleMenu('grid')}><LuLayoutGrid size={20} /></IconButton>
          {activeMenu === 'grid' && (<div className="panel-base" style={{ ...styles.menu, gridTemplateColumns: 'repeat(3, 1fr)', width: '100px' }}>{GRID_COLORS.map(c => (<div key={c} onClick={() => setGridColor(c)} style={{ ...styles.swatch, backgroundColor: c, border: gridColor === c ? '2px solid white' : '1px solid var(--button-border)' }} />))}</div>)}
        </div>

        <div style={styles.divider}></div>

        {/* AUTO LAYOUT / TEMPLATES */}
        <div style={{ position: 'relative' }}>
          <IconButton isActive={activeMenu === 'templates'} color="#4ecdc4" onClick={() => toggleMenu('templates')} title="Auto Layout Templates"><LuLayoutTemplate size={20} /></IconButton>
          {activeMenu === 'templates' && (
            <div className="panel-base" style={styles.templateMenu}>
                <div style={styles.templateHeader}>TEMPLATES</div>
                <button style={styles.templateItem} onClick={() => handleTemplateLoad('ideaMultiplier')}>
                    <LuLightbulb size={16} style={{marginRight:8}} /> Idea Multiplier
                </button>
                <button style={styles.templateItem} onClick={() => handleTemplateLoad('flowchart')}>
                    <LuActivity size={16} style={{marginRight:8}} /> Flowchart
                </button>
                <button style={styles.templateItem} onClick={() => handleTemplateLoad('journeyMap')}>
                    <LuMap size={16} style={{marginRight:8}} /> Journey Map
                </button>
            </div>
          )}
        </div>

        <div style={styles.divider}></div>

        {/* DELETE BUTTON (CLEAR BOARD) */}
        <div style={{ position: 'relative' }}>
          <IconButton color="#fa5252" onClick={() => toggleMenu('reset')} title="Clear Board"><LuTrash2 size={20} /></IconButton>
          {activeMenu === 'reset' && (
            <div className="panel-base" style={styles.confirmModal}>
              <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#fa5252', fontSize: '13px' }}>Clear Entire Board?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="icon-button" onClick={() => setActiveMenu(null)} style={{ fontSize: 12, padding: '6px 10px', width: 'auto', border: '1px solid #ddd' }}>Cancel</button>
                <button className="icon-button" onClick={handleConfirmReset} style={{ fontSize: 12, padding: '6px 10px', background: '#fa5252', borderColor: '#fa5252', color: 'white', width: 'auto' }}>Clear All</button>
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
  
  // Templates
  templateMenu: { position: 'absolute', left: '60px', bottom: '-50px', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', width: '160px', zIndex: 101 },
  templateHeader: { fontSize: '10px', fontWeight: 'bold', color: '#888', marginBottom: '4px', letterSpacing: '1px' },
  templateItem: { display: 'flex', alignItems: 'center', padding: '8px', border: 'none', background: 'transparent', color: 'var(--text-color)', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.2s', textAlign: 'left' },
  
  // Confirm Modal
  confirmModal: { position: 'absolute', left: '60px', bottom: 0, padding: '16px', borderRadius: '12px', width: '180px', zIndex: 102, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  
  swatch: { width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' },
};

export default Toolbar;