import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { LuLayoutGrid, LuClock } from 'react-icons/lu';

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [savedBoards, setSavedBoards] = useState([]);

   
  useEffect(() => {
    if (user) {
        
        fetch(`https://glorious-succotash-wrg7466vjpx629599-1234.app.github.dev/api/boards/:userId`.replace(':userId', user.id))
            .then(res => res.json())
            .then(data => setSavedBoards(data))
            .catch(err => console.error(err));
    }
  }, [user]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId) return;
    navigate(`/board/${roomId}`);
  };

  const createRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(7);
    navigate(`/board/${randomId}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
           <img 
                src="/logo.png" 
                alt="Logo" 
                style={{height: '80px', width: 'auto', objectFit: 'contain'}} 
            />
            <h2 style={{margin:0}}>Holoboard</h2>
        </div>
        <UserButton />
      </div>

      <div style={styles.content}>
        {/* LEFT: JOIN/CREATE */}
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
          <button onClick={createRandomRoom} style={styles.btnSecondary}>⚡ New Instant Board</button>
        </div>

        {/* RIGHT: SAVED BOARDS */}
        <div style={styles.listCard}>
            <h3 style={styles.heading}><LuClock style={{marginRight:8}}/> Your Saved Boards</h3>
            <div style={styles.grid}>
                {savedBoards.length === 0 ? (
                    <div style={{opacity:0.5, fontStyle:'italic'}}>No saved boards yet.</div>
                ) : (
                    savedBoards.map(board => (
                        <div key={board._id} style={styles.boardItem} onClick={() => navigate(`/board/${board.roomId}`)}>
                            <div style={styles.boardIcon}><LuLayoutGrid size={24}/></div>
                            <div>
                                <div style={styles.boardName}>{board.name}</div>
                                <div style={styles.boardDate}>Room: {board.roomId}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0f0f13', color: 'white', fontFamily: 'Inter, sans-serif' },
  nav: { display: 'flex', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid #333' },
  content: { display: 'flex', justifyContent: 'center', gap: '40px', padding: '60px 20px', flexWrap: 'wrap' },
  
  card: { width: '350px', padding: '30px', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333', height: 'fit-content' },
  listCard: { width: '400px', padding: '30px', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333' },
  
  title: { margin: '0 0 20px 0', fontSize: '24px' },
  heading: { margin: '0 0 20px 0', fontSize: '18px', display:'flex', alignItems:'center', color:'#888' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  group: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' },
  input: { background: '#222', border: '1px solid #444', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '16px' },
  btnPrimary: { background: '#6366f1', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  btnSecondary: { background: 'transparent', color: '#888', padding: '10px', border: '1px dashed #444', borderRadius: '8px', cursor: 'pointer', width: '100%' },
  divider: { textAlign: 'center', color: '#444', margin: '15px 0', fontSize: '14px' },

  grid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  boardItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#252529', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', border: '1px solid transparent' },
  boardIcon: { width: '40px', height: '40px', background: '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' },
  boardName: { fontWeight: 'bold', fontSize: '16px' },
  boardDate: { fontSize: '12px', color: '#888', marginTop: '4px' }
};

export default Dashboard;
