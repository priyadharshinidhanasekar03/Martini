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
  { id: 'home',     label: 'Home' },
  { id: 'time',     label: 'Time Machine' },
  { id: 'tonight',  label: 'Tonight' },
  { id: 'discover', label: 'Discover' },
];
function Header({ tab, setTab }) {
  return (
    <header style={styles.header}>
      <div style={styles.logo} onClick={() => setTab('home')}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <polygon points="16,3 29,26 3,26" stroke="#c9a84c" strokeWidth="1.2" fill="none"/>
          <line x1="16" y1="26" x2="16" y2="31" stroke="#c9a84c" strokeWidth="1.2"/>
          <line x1="11" y1="31" x2="21" y2="31" stroke="#c9a84c" strokeWidth="1.2"/>
          <circle cx="16" cy="15" r="1.8" fill="#c9a84c"/>
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