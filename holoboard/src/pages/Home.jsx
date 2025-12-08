import React from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div style={styles.container}>
      
      {/* BACKGROUND IMAGE */}
      <img 
        src="/hero.png" 
        alt="Hero Background" 
        style={styles.bgImage} 
      />

      {/* DARK OVERLAY */}
      <div style={styles.overlay}></div>

      {/* --- NAVBAR --- */}
      <nav style={styles.nav}>
        {/* LOGO IMAGE (Updated) */}
        <div style={styles.logo}>
          <img 
            src="/logo.png" 
            alt="Holoboard Logo" 
            style={styles.logoImage} 
          />
        </div>

        {/* BUTTONS */}
        <div style={styles.navActions}>
          <button style={styles.btnOutline} onClick={() => navigate('/dashboard')}>
            WORKSPACE
          </button>

          <SignedOut>
            <SignUpButton mode="modal">
              <button style={styles.btnRed}>REGISTER</button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button style={styles.btnRed}>LOGIN</button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
             <div style={styles.userBadge}>{user?.firstName}</div>
          </SignedIn>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div style={styles.content}>
        <h1 style={styles.heading}>
          WELCOME TO <span style={styles.redText}>HOLO</span> BOARD
        </h1>

        <div style={styles.subLinks}>
          <SignedOut>
            <SignUpButton mode="modal">
                <span style={styles.linkRed}>Register</span> 
            </SignUpButton>
            <span style={{margin: '0 8px'}}>to Start |</span>
            <SignInButton mode="modal">
                <span style={styles.linkRed}>Login</span>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <span 
                style={styles.linkRed} 
                onClick={() => navigate('/dashboard')}
            >
                Enter Dashboard
            </span>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

// --- CSS STYLES ---
const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    color: 'white',
    fontFamily: "'Orbitron', sans-serif", 
    position: 'relative',
    overflow: 'hidden',
  },
  bgImage: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
    zIndex: 1,
  },
  
  // NAV
  nav: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '30px 50px',
  },
  // LOGO STYLE (Updated)
  logoImage: {
    height: '110px', // Adjust height to fit your navbar
    width: 'auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' // Optional glow
  },
  navActions: {
    display: 'flex',
    gap: '20px',
  },
  
  // BUTTONS
  btnOutline: {
    background: 'transparent',
    border: '2px solid white',
    color: 'white',
    padding: '10px 25px',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    letterSpacing: '1px'
  },
  btnRed: {
    background: '#b91c1c',
    border: 'none',
    color: 'white',
    padding: '10px 25px',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    letterSpacing: '1px'
  },
  userBadge: {
    background: '#333',
    padding: '10px 20px',
    borderRadius: '30px',
    fontWeight: 'bold'
  },

  // MAIN TEXT
  content: {
    position: 'absolute',
    zIndex: 10,
    top: '50%',
    right: '10%',
    transform: 'translateY(-50%)',
    textAlign: 'right',
  },
  heading: {
    // FONT CHANGED HERE
    fontFamily: "michroma", 
    fontSize: '60px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    margin: '0 0 20px 0',
    
  },
  redText: {
    color: '#b91c1c',
  },
  
  subLinks: {
    fontSize: '18px',
    color: '#ccc',
    fontWeight: '500',
  },
  linkRed: {
    color: '#ef4444',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '5px',
    marginRight: '5px'
  }
};