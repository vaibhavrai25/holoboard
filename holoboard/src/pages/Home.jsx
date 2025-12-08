import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const wrapperRef = useRef(null);

  const fullTitle = "WELCOME TO HOLO BOARD";

  // state
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [audioLevel, setAudioLevel] = useState(0); // kept for starfield compatibility (default 0)
  const [titleText, setTitleText] = useState(""); // for typing animation

  const canvasRef = useRef(null);

  // --- Typewriter effect for title ---
  useEffect(() => {
    let idx = 0;
    setTitleText("");
    const interval = setInterval(() => {
      idx += 1;
      setTitleText(fullTitle.slice(0, idx));
      if (idx >= fullTitle.length) {
        clearInterval(interval);
      }
    }, 80); // typing speed (ms per character)
    return () => clearInterval(interval);
  }, [fullTitle]);

  // mouse parallax
  useEffect(() => {
    const wrap = wrapperRef.current;
    let raf = null;
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 100;
      const ny = (e.clientY / window.innerHeight) * 100;
      setMouse({ x: nx, y: ny });
      document.querySelectorAll('.layer').forEach(node => {
        const depth = Number(node.dataset.depth || 0.3);
        node.style.transform = `translate3d(${(nx-50) * depth * 0.6}vw, ${(ny-50) * depth * 0.35}vh, 0)`;
      });
    };
    if (wrap) { window.addEventListener('mousemove', onMove); }
    return ()=>{ window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  // --- Starfield effect (denser + brighter) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = window.innerWidth;
    let h = window.innerHeight;
    let DPR = Math.max(1, window.devicePixelRatio || 1);

    const resizeCanvas = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      DPR = Math.max(1, window.devicePixelRatio || 1);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resizeCanvas();

    // ===== increased density & glow (brighter/denser) =====
    const STAR_COUNT = Math.max(80, Math.floor((w * h) / 7000));
    const stars = Array.from({ length: STAR_COUNT }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.6 + 0.45,
      speed: Math.random() * 0.22 + 0.04,
      flickerPhase: Math.random() * Math.PI * 2,
      hueOffset: Math.random() * 12 - 6,
      glow: Math.random() * 0.9 + 0.7,
      brightness: Math.random() * 0.6 + 0.8,
    }));

    let rafId = null;
    let last = performance.now();

    const draw = (t) => {
      const dt = Math.min(60, t - last) / 1000;
      last = t;

      // slightly lighter fade so stars pop more
      ctx.fillStyle = "rgba(0,0,0,0.42)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.flickerPhase += dt * (1.0 + Math.random() * 1.0);
        const flicker = 1.05 + Math.sin(s.flickerPhase) * 0.25 + (audioLevel ? audioLevel * 0.12 : 0);

        const warm = Math.floor(248 + s.hueOffset);
        const green = Math.floor(Math.max(230, warm - 6));
        const blue = Math.floor(Math.max(215, warm - 20));
        const alpha = Math.min(1, 0.98 * flicker * s.glow * s.brightness);

        // soft glow radial
        const glowRadius = s.size * 3.6 * (s.glow * 1.05) * flicker;
        if (glowRadius > 0.6) {
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowRadius);
          grad.addColorStop(0, `rgba(${warm}, ${green}, ${blue}, ${Math.min(0.45, alpha * 0.45)})`);
          grad.addColorStop(0.5, `rgba(${warm}, ${green}, ${blue}, ${Math.min(0.18, alpha * 0.18)})`);
          grad.addColorStop(1, `rgba(${warm}, ${green}, ${blue}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // star core
        ctx.beginPath();
        ctx.fillStyle = `rgba(${warm}, ${green}, ${blue}, ${alpha})`;
        ctx.arc(s.x, s.y, s.size * flicker, 0, Math.PI * 2);
        ctx.fill();

        // white core for brightest
        if (s.size > 1.25) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${Math.min(0.6, 0.46 * flicker * s.brightness)})`;
          ctx.arc(s.x, s.y, Math.max(0.32, s.size * 0.46), 0, Math.PI * 2);
          ctx.fill();
        }

        // drift & wrap
        s.y += s.speed * (1 + (audioLevel ? audioLevel * 0.65 : 0));
        if (s.y > h + 6) {
          s.y = -6;
          s.x = Math.random() * w;
          s.size = Math.random() * 1.6 + 0.45;
          s.speed = Math.random() * 0.22 + 0.04;
          s.flickerPhase = Math.random() * Math.PI * 2;
          s.hueOffset = Math.random() * 12 - 6;
          s.glow = Math.random() * 0.9 + 0.7;
          s.brightness = Math.random() * 0.6 + 0.8;
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    const onResize = () => {
      resizeCanvas();
      stars.length = 0;
      const newCount = Math.max(80, Math.floor((window.innerWidth * window.innerHeight) / 7000));
      for (let i = 0; i < newCount; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 1.6 + 0.45,
          speed: Math.random() * 0.22 + 0.04,
          flickerPhase: Math.random() * Math.PI * 2,
          hueOffset: Math.random() * 12 - 6,
          glow: Math.random() * 0.9 + 0.7,
          brightness: Math.random() * 0.6 + 0.8,
        });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [audioLevel]);

  return (
    <div style={styles.container} ref={wrapperRef}>
      <style>{`
        /* layout layers */
        .parallax-wrapper { position: absolute; inset: 0; z-index: 1; }
        .layer img { width: 100%; height: 100%; object-fit: cover; display:block; }

        /* CANVAS: use overlay so stars interact richly with underlying image */
        #spaceCanvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2; /* above hero but under visual blend layer */
          pointer-events: none;
          mix-blend-mode: overlay;
          opacity: 0.98;
          will-change: transform, opacity;
        }

        /* stars-blend */
        .stars-blend {
          position: absolute;
          inset: 0;
          z-index: 2.6;
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.95;
          background:
            radial-gradient(30% 18% at 85% 26%, rgba(255,255,255,0.12), transparent 12%),
            radial-gradient(20% 12% at 70% 60%, rgba(255,240,210,0.08), transparent 12%),
            linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0));
          filter: blur(14px) saturate(1.12);
          transition: opacity 0.4s ease;
          animation: starsBlendMove 22s ease-in-out infinite alternate;
        }

        @keyframes starsBlendMove {
          0% { transform: translateY(0px) scale(1); opacity: 0.92; }
          100% { transform: translateY(-18px) scale(1.01); opacity: 0.98; }
        }

        .galaxy-nebula {
          position: absolute;
          top: -8%;
          left: -8%;
          width: 116%;
          height: 116%;
          z-index: 1.5;
          pointer-events: none;
          background:
            radial-gradient(40% 30% at 20% 30%, rgba(255,230,190,0.08), transparent 14%),
            radial-gradient(35% 25% at 77% 62%, rgba(255,240,210,0.06), transparent 12%);
          filter: blur(68px) saturate(1);
          animation: nebmove 28s ease-in-out infinite alternate;
          opacity: 0.9;
        }

        @keyframes nebmove {
          0% { transform: translate(0px, 0px) scale(1); }
          100% { transform: translate(36px, -18px) scale(1.03); }
        }

        /* right→left warm gradient to gently light image's right */
        .right-white-gradient {
          position: absolute;
          inset: 0;
          z-index: 1.9;
          pointer-events: none;
          background: linear-gradient(to left, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0) 70%);
          mix-blend-mode: screen;
          opacity: 0.95;
        }

        .thin-overlay {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.36) 100%);
        }

        .cta { text-shadow: 0 0 calc(var(--audio-intensity,0) * 22px) rgba(255,210,170,0.65); }

        /* Typewriter heading */
        .heading-typed {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          border-right: 2px solid rgba(255,255,255,0.9);
          animation: caretBlink 0.9s steps(1) infinite;
          transition: text-shadow 260ms ease, letter-spacing 260ms ease, transform 260ms ease;
        }
        .heading-typed:hover {
          letter-spacing: 6px;
          text-shadow: 0 0 28px rgba(255,255,255,0.18), 0 0 72px rgba(255,50,50,0.06);
          transform: translateY(-2px) scale(1.01);
        }
        @keyframes caretBlink {
          0%, 100% { border-color: transparent; }
          50% { border-color: rgba(255,255,255,0.9); }
        }

        /* ---------- Stronger hover effects ---------- */

        /* Logo: stronger 3D tilt + rotate + scale + glow */
        .logoImage {
          transition: transform 720ms cubic-bezier(.2,.8,.2,1), filter 360ms, box-shadow 360ms;
          transform-origin: 50% 50%;
          will-change: transform, filter, box-shadow;
          cursor: pointer;
          backface-visibility: hidden;
        }
        .logoImage:hover,
        .logoImage:focus {
          transform: perspective(800px) rotateY(18deg) rotateZ(360deg) scale(1.12);
          filter: drop-shadow(0 28px 60px rgba(255,80,80,0.15)) saturate(1.12);
          box-shadow: 0 28px 80px rgba(255,40,40,0.12), 0 8px 20px rgba(255,120,120,0.04);
        }

        .logoImage:active {
          transform: perspective(800px) rotateY(14deg) rotateZ(0deg) scale(1.06);
        }

        /* Generic button hover: stronger lift + gradient sweep + glowing shadow */
        .btnHover {
          transition: transform 240ms cubic-bezier(.16,.9,.2,1), box-shadow 240ms, background-position 420ms, filter 240ms;
          transform-origin: center;
          will-change: transform, box-shadow, background-position;
          cursor: pointer;
          border-radius: 28px;
          padding: 10px 22px;
        }
        .btnHover:hover {
          transform: translateY(-8px) scale(1.06);
          box-shadow: 0 32px 90px rgba(0,0,0,0.55), 0 10px 36px rgba(255,80,80,0.11);
          filter: brightness(1.06) saturate(1.06);
        }
        .btnHover:active { transform: translateY(-2px) scale(1.03); }
        .btnHover:focus { outline: 3px solid rgba(255,200,150,0.12); outline-offset: 4px; }

        /* Outline button special */
        .btnOutline.btnHover {
          background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00));
          border: 2px solid rgba(255,255,255,0.9);
          background-size: 300% 100%;
          background-position: 100% 0%;
        }
        .btnOutline.btnHover:hover {
          background-position: 0% 0%;
          border-color: rgba(255, 255, 255, 1);
          box-shadow: 0 22px 60px rgba(255,255,255,0.04), 0 10px 30px rgba(255,50,50,0.06);
        }

        /* Red solid with energetic pulse on hover */
        .btnRed.btnHover {
          background: linear-gradient(90deg, #b91c1c, #ef4444 60%);
          border: none;
          background-size: 300% 100%;
          background-position: 100% 0%;
        }
        .btnRed.btnHover:hover {
          transform: translateY(-8px) scale(1.08);
          background-position: 0% 0%;
          box-shadow: 0 36px 110px rgba(235,60,60,0.22), 0 12px 38px rgba(255,120,120,0.08);
          animation: btnPulse 1.6s ease-in-out infinite;
        }
        @keyframes btnPulse {
          0% { box-shadow: 0 28px 80px rgba(235,60,60,0.18), 0 8px 24px rgba(255,120,120,0.06); transform: translateY(-6px) scale(1.06); }
          50% { box-shadow: 0 44px 130px rgba(235,60,60,0.28), 0 14px 48px rgba(255,120,120,0.10); transform: translateY(-10px) scale(1.10); }
          100% { box-shadow: 0 28px 80px rgba(235,60,60,0.18), 0 8px 24px rgba(255,120,120,0.06); transform: translateY(-6px) scale(1.06); }
        }

        /* Enter Dashboard: stronger focus/hover micro-bounce */
        .enterBtn {
          transition: transform 280ms cubic-bezier(.2,.9,.2,1), box-shadow 280ms;
          will-change: transform, box-shadow;
        }
        .enterBtn:hover {
          transform: translateY(-10px) scale(1.12) rotateZ(-1deg);
          box-shadow: 0 40px 120px rgba(235,60,60,0.26), 0 16px 48px rgba(255,80,80,0.08);
        }
        .enterBtn:focus {
          transform: translateY(-6px) scale(1.08);
          outline: 3px solid rgba(255,60,60,0.12);
        }

        /* user badge hover glow */
        .userBadgeHover {
          transition: box-shadow 220ms, transform 220ms;
        }
        .userBadgeHover:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 18px 40px rgba(255,80,80,0.08), inset 0 0 10px rgba(255,80,80,0.02);
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .logoImage, .btnHover, .heading-typed, .btnRed.btnHover { transition: none !important; animation: none !important; transform: none !important; }
        }
      `}</style>

      {/* Power Ranger / hero background */}
      <div className="parallax-wrapper" aria-hidden>
        <div className="layer" data-depth="0.16"><img src="/hero.png" alt="" /></div>
        <div className="layer" data-depth="0.32"><img src="/hero.png" alt="" style={{filter:'brightness(0.92) contrast(1.05)'}}/></div>
        <div className="layer" data-depth="0.6"><img src="/hero.png" alt="" style={{filter:'hue-rotate(0deg) saturate(1.05)'}}/></div>
      </div>

      {/* Right-to-left white gradient (lights right side subtly) */}
      <div className="right-white-gradient" aria-hidden />

      {/* subtle nebula */}
      <div className="galaxy-nebula" aria-hidden />

      {/* starfield canvas */}
      <canvas id="spaceCanvas" ref={canvasRef} />

      {/* EXTRA blend layer that brightens & screens highlights over stars+hero */}
      <div className="stars-blend" aria-hidden />

      {/* thin gradient overlay */}
      <div className="thin-overlay" />

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          {/* add tabindex for keyboard focus */}
          <img
            src="/logo.png"
            alt="Holoboard Logo"
            style={styles.logoImage}
            className="logoImage"
            tabIndex={0}
            onMouseEnter={(e)=> e.currentTarget.classList.add('spin')}
            onMouseLeave={(e)=> e.currentTarget.classList.remove('spin')}
          />
        </div>

        <div style={styles.navActions} className="navActionsWrap">
          <button
            className="btnHover btnOutline"
            style={styles.btnOutline}
            onClick={() => navigate('/dashboard')}
            aria-label="Open workspace"
          >
            WORKSPACE
          </button>

          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btnHover btnRed" style={styles.btnRed}>REGISTER</button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="btnHover btnRed" style={styles.btnRed}>LOGIN</button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div style={{...styles.userBadge}} className="userBadgeHover">{user?.firstName}</div>
          </SignedIn>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={styles.content}>
        <h1
          className="heading-typed"
          style={{ ...styles.heading, color: '#ffffff', fontFamily: "'Ubuntu Mono', monospace" }}
        >
          {titleText || fullTitle}
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
            <button
              className="btnHover btnRed enterBtn"
              style={{ ...styles.btnRed, marginLeft: 10 }}
              onClick={() => navigate('/dashboard')}
            >
              Enter Dashboard
            </button>
          </SignedIn>
        </div>
      </div>

      {/* spotlight still uses mouse */}
      <div
        className="spotlight"
        style={{['--mx']: mouse.x + '%', ['--my']: mouse.y + '%'}}
        aria-hidden
      ></div>
    </div>
  );
}

// styles same as before (kept inline styles to preserve your original look)
const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    color: 'white',
    fontFamily: "'Space Grotesk', sans-serif",
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
    background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.78) 100%)',
    zIndex: 1,
  },
  nav: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '30px 50px',
  },
  logoImage: {
    height: '110px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
  },
  navActions: {
    display: 'flex',
    gap: '20px',
  },
  btnOutline: {
    background: 'transparent',
    border: '2px solid white',
    color: 'white',
    padding: '10px 25px',
    borderRadius: '30px',
    fontWeight: '700',
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
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    letterSpacing: '1px'
  },
  userBadge: {
    background: '#333',
    padding: '10px 20px',
    borderRadius: '30px',
    fontWeight: '700'
  },
  content: {
    position: 'absolute',
    zIndex: 5,
    top: '50%',
    right: '10%',
    transform: 'translateY(-50%)',
    textAlign: 'right',
  },
  heading: {
    fontFamily: "'Ubuntu Mono', monospace",
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
    fontWeight: '700',
    marginLeft: '5px',
    marginRight: '5px'
  }
};