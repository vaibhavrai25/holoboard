import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { LuLayoutGrid, LuClock, LuPlus, LuTrash2, LuX } from 'react-icons/lu';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  
  const [roomId, setRoomId] = useState('');
  const [savedBoards, setSavedBoards] = useState([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);
  const [boardToDelete, setBoardToDelete] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    setIsLoadingBoards(true);
    fetch(`https://holoboard-backend.onrender.com/api/boards/${user.id}`)
        .then(res => res.json())
        .then(data => setSavedBoards(data))
        .catch(err => console.error(err))
        .finally(() => setIsLoadingBoards(false));
  }, [user, isLoaded]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId) return;
    navigate(`/board/${roomId}`);
  };

  const createRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(7);
    navigate(`/board/${randomId}`);
  };

  const confirmDelete = (e, boardId) => {
    // CRITICAL: Stop the click from opening the board
    e.stopPropagation(); 
    e.preventDefault(); 
    setBoardToDelete(boardId);
  };

  const executeDelete = async () => {
    if (!boardToDelete) return;
    try {
        // Using the stored _id to delete from backend
        const res = await fetch(`https://holoboard-backend.onrender.com/api/boards/${boardToDelete}`, {
            method: 'DELETE',
        });
        
        if (res.ok) {
            // Update UI: Filter by _id, not roomId
            setSavedBoards(prev => prev.filter(b => b._id !== boardToDelete));
            setBoardToDelete(null);
        } else {
            console.error("Failed to delete, server returned:", res.status);
        }
    } catch (err) {
        console.error("Delete failed", err);
    }
  };

  if (!isLoaded) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      
      {/* NAVBAR */}
      <div style={styles.nav}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
            <img src="/logo.png" alt="Logo" style={{height: '40px', width: 'auto', objectFit: 'contain'}} />
            <h2 style={{margin:0}}>Holoboard</h2>
        </div>
        <UserButton />
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.content}>
        
        {/* CARDS CONTAINER */}
        <div style={styles.cardsWrapper}>
            {/* LEFT: CREATE */}
            <div style={styles.card}>
              <h1 style={styles.title}>Start Creating</h1>
              <form onSubmit={handleJoin} style={styles.form}>
                <div style={styles.group}>
                  <label style={styles.label}>Room ID</label>
                  <input style={styles.input} placeholder="Enter Room Name..." value={roomId} onChange={(e) => setRoomId(e.target.value)} />
                </div>
                <button type="submit" style={styles.btnPrimary}>Join Room ➔</button>
              </form>
              <div style={styles.divider}>or</div>
              <button onClick={createRandomRoom} style={styles.btnSecondary}><LuPlus style={{marginBottom:-2}}/> New Instant Board</button>
            </div>

            {/* RIGHT: SAVED LIST */}
            <div style={styles.listCard}>
                <h3 style={styles.heading}><LuClock style={{marginRight:8}}/> Saved Boards</h3>
                {isLoadingBoards ? (
                    <div style={{opacity:0.5, padding:20}}>Loading...</div>
                ) : (
                    <div style={styles.scrollArea}>
                        <div style={styles.grid}>
                            {savedBoards.length === 0 ? (
                                <div style={{opacity:0.5, fontStyle:'italic', fontSize: 14}}>No saved boards found.</div>
                            ) : (
                                savedBoards.map(board => (
                                    <div 
                                      key={board._id} 
                                      style={styles.boardItem} 
                                      onClick={() => navigate(`/board/${board.roomId}`)}
                                    >
                                        <div style={{display:'flex', alignItems:'center', gap:12, flex:1, overflow:'hidden'}}>
                                            <div style={styles.boardIcon}><LuLayoutGrid size={20}/></div>
                                            <div style={{minWidth: 0}}>
                                                <div style={styles.boardName}>{board.name || "Untitled"}</div>
                                                <div style={styles.boardDate}>ID: {board.roomId}</div>
                                            </div>
                                        </div>
                                        
                                        {/* FIX: Pass board._id here, NOT board.roomId */}
                                        <button 
                                          className="delete-btn" 
                                          style={styles.deleteBtn} 
                                          onClick={(e) => confirmDelete(e, board._id)} 
                                          title="Delete"
                                        >
                                            <LuTrash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* MODAL */}
      {boardToDelete && (
        <div style={styles.modalOverlay}>
            <div style={styles.modal}>
                <div style={{display:'flex', alignItems:'center', gap:10, color:'#fa5252', marginBottom:15}}>
                    <LuX size={24} />
                    <h3 style={{margin:0}}>Delete Board?</h3>
                </div>
                <p style={{fontSize:14, color:'#ccc', marginBottom:20}}>Are you sure you want to delete this board?</p>
                <div style={{display:'flex', justifyContent:'flex-end', gap:10}}>
                    <button style={styles.modalCancel} onClick={() => setBoardToDelete(null)}>Cancel</button>
                    <button style={styles.modalConfirm} onClick={executeDelete}>Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    background: '#0f0f13', 
    color: 'white', 
    fontFamily: 'Inter, sans-serif',
    overflow: 'hidden' 
  },
  
  loading: { height: '100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0f13', color:'white' },
  
  nav: { 
    height: '80px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '0 40px', 
    background: '#1a1a1a', 
    borderBottom: '1px solid #333',
    zIndex: 10,
    fontFamily: 'Helvetica'
  },

  content: { 
    flex: 1, 
    backgroundImage: 'url("/roomIDbackground.png")', 
    backgroundSize: "cover",
    backgroundPosition: 'center40px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: '60px',
    overflowY: 'auto' 
  },
  
  cardsWrapper: {
      display: 'flex',
      gap: '30px',
      flexWrap: 'wrap',
      justifyContent: 'center'
  },

  card: { width: '350px', padding: '30px', background: 'rgba(26, 26, 26, 0.85)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  listCard: { width: '350px', padding: '25px', background: 'rgba(26, 26, 26, 0.85)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', height: '420px', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  
  scrollArea: { overflowY: 'auto', flex: 1, paddingRight: '5px', marginTop: '10px' },
  title: { margin: '0 0 20px 0', fontSize: '24px' },
  heading: { margin: '0', fontSize: '18px', display:'flex', alignItems:'center', color:'#ccc' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  group: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' },
  input: { background: 'rgba(0,0,0,0.3)', border: '1px solid #555', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '16px' },
  btnPrimary: { background: '#4b0a42ff', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  btnSecondary: { background: 'transparent', color: '#f6fbfbff', padding: '10px', border: '1px dashed #555', borderRadius: '8px', cursor: 'pointer', width: '100%', display:'flex', alignItems:'center', justifyContent:'center', gap:5 , background: 'rgba(8, 55, 81, 0.63)'},
  divider: { textAlign: 'center', color: '#666', margin: '15px 0', fontSize: '14px' },
  grid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  
  boardItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent', position: 'relative', overflow: 'hidden' },
  boardIcon: { width: '32px', height: '32px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' },
  boardName: { fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  boardDate: { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  
  // Added zIndex here to ensure it's clickable above the card
  deleteBtn: { background: 'transparent', border: 'none', color: '#fa5252', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7, transition: 'all 0.2s', zIndex: 5 },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' },
  modal: { background: '#1a1a1a', padding: '25px', borderRadius: '12px', border: '1px solid #333', width: '320px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out' },
  modalCancel: { background: 'transparent', border: '1px solid #444', color: '#ccc', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  modalConfirm: { background: '#fa5252', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`;
document.head.appendChild(styleSheet);

export default Dashboard;