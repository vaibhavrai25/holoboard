import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState(''); // Kept for UI requirement

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId) return;
    // Navigate to the dynamic board URL
    navigate(`/board/${roomId}`);
  };

  const createRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(7);
    navigate(`/board/${randomId}`);
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.nav}>
        <h2 style={{margin:0}}>🛸 Holoboard</h2>
        <UserButton />
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Join a Room</h1>
          <p style={styles.subtitle}>Collaborate with your team in real-time.</p>

          <form onSubmit={handleJoin} style={styles.form}>
            {/* NAME FIELD (Read only from Clerk) */}
            <div style={styles.group}>
              <label style={styles.label}>Your Name</label>
              <input 
                style={{...styles.input, opacity: 0.6, cursor: 'not-allowed'}} 
                value={user?.firstName || "User"} 
                readOnly 
              />
            </div>

            {/* ROOM ID FIELD */}
            <div style={styles.group}>
              <label style={styles.label}>Room ID</label>
              <input 
                style={styles.input} 
                placeholder="e.g. engineering-team" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD FIELD (Visual only for now) */}
            <div style={styles.group}>
              <label style={styles.label}>Room Password (Optional)</label>
              <input 
                type="password"
                style={styles.input} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" style={styles.btnPrimary}>Enter Room ➔</button>
          </form>

          <div style={styles.divider}>or</div>

          <button onClick={createRandomRoom} style={styles.btnSecondary}>
            ⚡ Create New Instant Room
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0f0f13', color: 'white', fontFamily: 'Inter, sans-serif' },
  nav: { display: 'flex', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid #333' },
  content: { display: 'flex', justifyContent: 'center', paddingTop: '80px' },
  card: { width: '400px', padding: '40px', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
  title: { margin: '0 0 10px 0', fontSize: '28px' },
  subtitle: { color: '#888', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  group: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' },
  input: { background: '#222', border: '1px solid #444', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '16px' },
  btnPrimary: { background: '#6366f1', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  divider: { textAlign: 'center', color: '#444', margin: '20px 0', fontSize: '14px' },
  btnSecondary: { background: 'transparent', color: '#888', padding: '10px', border: '1px dashed #444', borderRadius: '8px', cursor: 'pointer', width: '100%' },
};

export default Dashboard;