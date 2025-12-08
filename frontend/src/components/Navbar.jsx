import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import useStore from '../store/useStore';
import { LuSave, LuMoon, LuSun, LuImage, LuShare2, LuCheck, LuPenLine, LuX, LuInfo } from 'react-icons/lu';

const Navbar = () => {
  const { roomId } = useParams();
  const { user } = useUser();
  
  // Store
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const shapes = useStore((state) => state.shapes);
  const connectors = useStore((state) => state.connectors);
  const boardName = useStore((state) => state.boardName);
  const setBoardName = useStore((state) => state.setBoardName);
  
  // UI State
  const [copied, setCopied] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [tempName, setTempName] = useState(boardName); 
  
  // Status: 'idle' | 'validating' | 'confirm-replace' | 'saving' | 'success' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset when menu opens
  useEffect(() => {
    if (showSaveMenu) {
        setSaveStatus('idle');
        setErrorMessage('');
        setTempName(boardName);
    }
  }, [showSaveMenu, boardName]);

  const triggerExport = () => window.dispatchEvent(new CustomEvent('export-image'));

  const copyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- STEP 1: PRE-CHECK LOGIC ---
  const handlePreCheck = async () => {
    // 1. Check Empty Name
    if (!tempName.trim()) {
        setErrorMessage("Name cannot be empty");
        return;
    }
    setErrorMessage(''); // Clear errors
    setSaveStatus('validating');

    try {
        // 2. Fetch existing boards to check for duplicates
        const res = await fetch(`https://holoboard-backend.onrender.com/api/boards/${user.id}`);
        const boards = await res.json();

        // Check if ANY other board (not this one) has the same name
        const duplicate = boards.find(b => b.name.toLowerCase() === tempName.trim().toLowerCase() && b.roomId !== roomId);

        if (duplicate) {
            setSaveStatus('confirm-replace'); // Trigger Confirmation UI
        } else {
            executeSave(); // No duplicate, proceed immediately
        }
    } catch (err) {
        // If fetch fails (maybe offline), just try to save anyway
        executeSave(); 
    }
  };

  // --- STEP 2: ACTUAL SAVE LOGIC ---
  const executeSave = async () => {
    setSaveStatus('saving');

    const payload = { roomId, userId: user.id, name: tempName.trim(), data: { shapes, connectors } };

    try {
        const response = await fetch('https://holoboard-backend.onrender.com/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if(result.success) {
            setBoardName(tempName.trim());
            setSaveStatus('success'); 
            setTimeout(() => { setShowSaveMenu(false); setSaveStatus('idle'); }, 1000);
        } else {
            setSaveStatus('error');
        }
    } catch (error) {
        setSaveStatus('error');
    }
  };

  return (
    <div className="panel-base" style={styles.navbar}>
      <div style={styles.left}>
        <img 
                src="/logo.png" 
                alt="Logo" 
                style={{height: '80px', width: 'auto', objectFit: 'contain'}} 
            />
        <div style={styles.titleContainer}>
            <span style={styles.title}>{boardName}</span>
            <LuPenLine size={14} style={{opacity:0.5, cursor:'pointer'}} onClick={() => setShowSaveMenu(true)} />
        </div>
        {roomId && (
          <div style={styles.roomBadge} onClick={copyRoomId} title="Copy ID">
            <span style={{opacity: 0.6}}>ID:</span>
            <span style={{fontWeight: 'bold', color: '#6366f1'}}>{roomId}</span>
            {copied ? <LuCheck size={14} color="#4ecdc4"/> : <LuShare2 size={14} style={{opacity:0.5}}/>}
          </div>
        )}
      </div>

      <div style={styles.right}>
        <div style={{position: 'relative'}}>
            {roomId && (
                <button onClick={() => setShowSaveMenu(!showSaveMenu)} className="icon-button" style={{...styles.button, borderColor: showSaveMenu ? '#4ecdc4' : 'var(--button-border)', color: showSaveMenu ? '#4ecdc4' : 'var(--text-color)'}}>
                    <LuSave /> Save
                </button>
            )}
            
            {/* --- SAVE DIALOG --- */}
            {showSaveMenu && (
                <div className="panel-base" style={styles.saveMenu}>
                    
                    {/* VIEW 1: SUCCESS */}
                    {saveStatus === 'success' && (
                        <div style={styles.statusView}>
                            <div style={styles.successIcon}><LuCheck size={24} /></div>
                            <span style={{fontWeight:'bold', color:'#4ecdc4'}}>Saved!</span>
                        </div>
                    )}

                    {/* VIEW 2: ERROR */}
                    {saveStatus === 'error' && (
                        <div style={styles.statusView}>
                            <LuInfo size={30} color="#fa5252" />
                            <span style={{fontWeight:'bold', color:'#fa5252', marginTop: 8}}>Save Failed</span>
                            <button onClick={() => setSaveStatus('idle')} style={styles.retryBtn}>Try Again</button>
                        </div>
                    )}

                    {/* VIEW 3: CONFIRM DUPLICATE */}
                    {saveStatus === 'confirm-replace' && (
                        <div style={{...styles.statusView, alignItems:'flex-start', padding:'0 8px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:8, color:'#eab308', fontWeight:'bold'}}>
                                <LuX /> File exists!
                            </div>
                            <p style={{fontSize:12, color:'var(--text-color)', opacity:0.8, margin:'8px 0'}}>
                                You already have a board named <b>"{tempName}"</b>. Use this name anyway?
                            </p>
                            <div style={styles.menuActions}>
                                <button style={styles.cancelBtn} onClick={() => setSaveStatus('idle')}>No, Rename</button>
                                <button style={styles.confirmBtn} onClick={executeSave}>Yes, Save</button>
                            </div>
                        </div>
                    )}

                    {/* VIEW 4: DEFAULT FORM */}
                    {(saveStatus === 'idle' || saveStatus === 'validating' || saveStatus === 'saving') && (
                        <>
                            <div style={styles.menuHeader}>
                                <span>Save Board</span>
                                <LuX style={{cursor:'pointer'}} onClick={() => setShowSaveMenu(false)} />
                            </div>
                            
                            <div style={{display:'flex', flexDirection:'column', gap:8}}>
                                <label style={{fontSize:11, color:'#aaa', textTransform:'uppercase'}}>File Name</label>
                                <input 
                                    style={{
                                        ...styles.input, 
                                        borderColor: errorMessage ? '#fa5252' : 'var(--button-border)'
                                    }} 
                                    value={tempName} 
                                    onChange={(e) => {
                                        setTempName(e.target.value);
                                        if(errorMessage) setErrorMessage(''); // Clear error on type
                                    }} 
                                    autoFocus
                                    disabled={saveStatus !== 'idle'}
                                />
                                {errorMessage && <span style={{fontSize:11, color:'#fa5252'}}>{errorMessage}</span>}
                            </div>

                            <div style={styles.menuActions}>
                                <button style={styles.cancelBtn} onClick={() => setShowSaveMenu(false)}>Cancel</button>
                                <button 
                                    style={{
                                        ...styles.confirmBtn,
                                        opacity: saveStatus !== 'idle' ? 1 : 1,
                                        cursor: saveStatus !== 'idle' ? 'wait' : 'pointer'
                                    }} 
                                    onClick={handlePreCheck}
                                    disabled={saveStatus !== 'idle'}
                                >
                                    {saveStatus === 'validating' || saveStatus === 'saving' ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
        <button onClick={toggleTheme} className="icon-button" style={styles.button}>{theme === 'light' ? <LuMoon /> : <LuSun />}</button>
        <button onClick={triggerExport} className="icon-button" style={{...styles.button, borderColor:'#ffeb3b', color:'#ffeb3b'}}><LuImage /> Export</button>
        <div style={{marginLeft: '10px'}}><UserButton afterSignOutUrl="/" /></div>
      </div>
    </div>
  );
};

const styles = {
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 200, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', boxSizing: 'border-box' },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  titleContainer: { display: 'flex', alignItems: 'center', gap: 8 },
  title: { margin: 0, fontSize: '18px', fontWeight: 700 },
  roomBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-color)', border: '1px solid var(--button-border)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', marginLeft: '10px', transition: 'all 0.2s' },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  button: { padding: '8px 12px', fontSize: '14px', fontWeight: 600, gap: '8px' },
  
  saveMenu: {
    position: 'absolute', top: '45px', right: 0, width: '260px', minHeight: '140px',
    padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column',
    gap: '16px', zIndex: 201, justifyContent: 'center', animation: 'fadeIn 0.2s ease-out'
  },
  menuHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: 14 },
  input: { background: 'var(--bg-color)', border: '1px solid var(--button-border)', color: 'var(--text-color)', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  menuActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', width:'100%' },
  cancelBtn: { background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  confirmBtn: { background: '#4ecdc4', color: '#1a1a1a', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' },
  statusView: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '100px' },
  successIcon: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(78, 205, 196, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ecdc4', marginBottom: 10 },
  retryBtn: { marginTop: 10, padding: '4px 10px', background: 'transparent', border: '1px solid #fa5252', color: '#fa5252', borderRadius: 4, cursor: 'pointer', fontSize: 12 }
};

export default Navbar;