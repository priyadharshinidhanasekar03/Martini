import React from 'react';

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.75rem 3rem',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'rgba(8,8,8,0.92)',
    backdropFilter: 'blur(16px)',
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    cursor: 'pointer',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.5rem',
    fontWeight: 900,
    color: 'var(--gold)',
    letterSpacing: '0.06em',
  },
  logoSub: {
    fontSize: '0.55rem',
    color: 'var(--muted)',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    marginTop: '1px',
  },
  nav: {
    display: 'flex',
    gap: 0,
  },
};
const tabs = [
  { id: 'home',       label: 'Home' },
  { id: 'time',       label: 'Time Machine' },
  { id: 'tonight',    label: 'Tonight' },
  { id: 'discover',   label: 'Discover' },
  { id: 'discussion', label: 'Discussion' },
];
function Header({ tab, setTab }) {
  return (
    <header style={styles.header}>
      <div style={styles.logo} onClick={() => setTab('home')}>
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
  {/* Film strip body */}
  <rect x="1" y="4" width="34" height="20" rx="1.5" stroke="#c9a84c" strokeWidth="1.2" fill="none"/>
  {/* Center frame */}
  <rect x="11" y="7" width="14" height="14" rx="0.5" stroke="#c9a84c" strokeWidth="1" fill="rgba(201,168,76,0.08)"/>
  {/* Left sprocket holes */}
  <rect x="3.5" y="7" width="4" height="3.5" rx="0.5" fill="#c9a84c" opacity="0.7"/>
  <rect x="3.5" y="12" width="4" height="3.5" rx="0.5" fill="#c9a84c" opacity="0.7"/>
  <rect x="3.5" y="17" width="4" height="3.5" rx="0.5" fill="#c9a84c" opacity="0.7"/>
  {/* Right sprocket holes */}
  <rect x="28.5" y="7" width="4" height="3.5" rx="0.5" fill="#c9a84c" opacity="0.7"/>
  <rect x="28.5" y="12" width="4" height="3.5" rx="0.5" fill="#c9a84c" opacity="0.7"/>
  <rect x="28.5" y="17" width="4" height="3.5" rx="0.5" fill="#c9a84c" opacity="0.7"/>
  {/* Play button in center frame */}
  <polygon points="15,10.5 15,17.5 22,14" fill="#c9a84c" opacity="0.9"/>
</svg>
        <div>
          <div style={styles.logoText}>Martini</div>
          <div style={styles.logoSub}>For people who take cinema seriously</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
              color: tab === t.id ? 'var(--gold)' : 'var(--muted)',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '0.5rem 1.1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Header;