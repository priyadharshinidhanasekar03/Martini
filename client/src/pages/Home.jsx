import React, { useState, useEffect } from 'react';

const DIALOGUES = [
  '"Here\'s looking at you, kid." — Casablanca',
  '"All those moments will be lost in time, like tears in rain." — Blade Runner',
  '"You\'re gonna need a bigger boat." — Jaws',
  '"Why so serious?" — The Dark Knight',
  '"I\'ll have what she\'s having." — When Harry Met Sally',
  '"Just keep swimming." — Finding Nemo',
  '"To infinity and beyond." — Toy Story',
  '"I am your father." — The Empire Strikes Back',
];

const TILES = [
  { icon: '🕰️', title: 'Time Machine', desc: 'Travel through film history. Every year, every language, every era.', tab: 'time' },
  { icon: '🎬', title: 'Tonight\'s Pick', desc: 'Three questions. One perfect film. No pressure.', tab: 'tonight' },
  { icon: '💞', title: 'Compatibility', desc: 'Two tastes. One AI. Find what you\'ll both love.', tab: 'compat' },
  { icon: '🎭', title: 'Cinema Identity', desc: 'Discover the cinephile archetype that defines your soul.', tab: 'identity' },
];

function Home({ setTab }) {
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setDialogueIdx(i => (i + 1) % DIALOGUES.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{
        padding: '5.5rem 3rem 3.5rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '0.6rem',
          letterSpacing: '0.34em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '1.5rem',
        }}>
          ✦ The last shot of your day, sorted ✦
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3rem, 9vw, 6.5rem)',
          fontWeight: 900,
          lineHeight: 0.93,
          color: 'var(--cream)',
          marginBottom: '1.5rem',
        }}>
          Cinema<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Reimagined</em>
        </h1>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.15rem',
          color: 'var(--muted)',
          fontStyle: 'italic',
          maxWidth: '440px',
          margin: '0 auto 1.5rem',
          lineHeight: 1.6,
        }}>
          For those who don't just watch films — they live inside them.
        </p>

        {/* Rotating Dialogue */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '1rem',
          color: 'var(--muted)',
          marginBottom: '2.5rem',
          minHeight: '1.5rem',
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}>
          {DIALOGUES[dialogueIdx]}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTab('time')}
            style={{
              background: 'var(--gold)',
              color: 'var(--bg)',
              border: 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '0.85rem 2.2rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}>
            Enter the Time Machine
          </button>
          <button
            onClick={() => setTab('tonight')}
            style={{
              background: 'none',
              color: 'var(--gold)',
              border: '1px solid rgba(201,168,76,0.4)',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '0.85rem 2.2rem',
              cursor: 'pointer',
            }}>
            What to Watch Tonight
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0' }} />

      {/* Feature Tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '1px',
        background: 'var(--border)',
      }}>
        {TILES.map(f => (
          <div
            key={f.tab}
            onClick={() => setTab(f.tab)}
            style={{
              background: 'var(--card)',
              padding: '2rem 1.75rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>{f.icon}</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1rem',
              color: 'var(--cream)',
              marginBottom: '0.4rem',
            }}>
              {f.title}
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.88rem',
              color: 'var(--muted)',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        marginTop: '1px',
      }}>
        <div style={{
          fontSize: '0.6rem',
          color: 'var(--muted)',
          letterSpacing: '0.14em',
          lineHeight: 2,
        }}>
          "That's a wrap — it's a Martini." <br />
          Powered by TMDB · Claude AI · Built for cinephiles
        </div>
      </div>
    </div>
  );
}

export default Home;