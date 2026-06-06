import React, { useState, useEffect, useRef } from 'react';
import { getPopularMovies, IMG_BASE, BACKDROP_BASE, tmdbFetch } from '../api/tmdb';
import { useWhisper } from '../hooks/useWhisper';
import MovieModal from '../components/movies/MovieModal';

const DIALOGUES = [
  '"Here\'s looking at you, kid." — Casablanca',
  '"All those moments will be lost in time, like tears in rain." — Blade Runner',
  '"You\'re gonna need a bigger boat." — Jaws',
  '"Why so serious?" — The Dark Knight',
  '"I\'ll have what she\'s having." — When Harry Met Sally',
  '"Just keep swimming." — Finding Nemo',
  '"I am your father." — The Empire Strikes Back',
  '"To infinity and beyond." — Toy Story',
];

// Famous films and their release dates for "On This Day"
const CINEMA_HISTORY = [
  { title: 'The Godfather', date: '03-15', year: 1972, tmdbId: 238 },
  { title: 'Pulp Fiction', date: '05-12', year: 1994, tmdbId: 680 },
  { title: 'Inception', date: '07-16', year: 2010, tmdbId: 27205 },
  { title: 'Parasite', date: '05-30', year: 2019, tmdbId: 496243 },
  { title: 'The Dark Knight', date: '07-18', year: 2008, tmdbId: 155 },
  { title: 'Interstellar', date: '11-05', year: 2014, tmdbId: 157336 },
  { title: 'Schindler\'s List', date: '11-30', year: 1993, tmdbId: 424 },
  { title: 'Goodfellas', date: '09-19', year: 1990, tmdbId: 769 },
  { title: 'Fight Club', date: '10-15', year: 1999, tmdbId: 550 },
  { title: 'Forrest Gump', date: '07-06', year: 1994, tmdbId: 13 },
  { title: 'The Silence of the Lambs', date: '01-30', year: 1991, tmdbId: 275 },
  { title: 'Se7en', date: '09-22', year: 1995, tmdbId: 807 },
  { title: 'The Matrix', date: '03-31', year: 1999, tmdbId: 603 },
  { title: 'Gladiator', date: '05-05', year: 2000, tmdbId: 98 },
  { title: 'Titanic', date: '12-19', year: 1997, tmdbId: 597 },
  { title: 'Whiplash', date: '10-10', year: 2014, tmdbId: 244786 },
  { title: 'La La Land', date: '12-09', year: 2016, tmdbId: 313369 },
  { title: 'Joker', date: '10-04', year: 2019, tmdbId: 475557 },
  { title: 'Oppenheimer', date: '07-21', year: 2023, tmdbId: 872585 },
  { title: 'Dune', date: '10-22', year: 2021, tmdbId: 438631 },
  { title: 'Everything Everywhere All at Once', date: '03-25', year: 2022, tmdbId: 545611 },
  { title: 'Mad Max Fury Road', date: '05-15', year: 2015, tmdbId: 76341 },
  { title: 'Get Out', date: '02-24', year: 2017, tmdbId: 419430 },
  { title: 'Hereditary', date: '06-08', year: 2018, tmdbId: 493922 },
  { title: 'Moonlight', date: '10-21', year: 2016, tmdbId: 376867 },
  { title: 'Spirited Away', date: '07-20', year: 2001, tmdbId: 129 },
  { title: 'Oldboy', date: '11-21', year: 2003, tmdbId: 670 },
  { title: 'City of God', date: '08-30', year: 2002, tmdbId: 598 },
  { title: 'Amélie', date: '04-25', year: 2001, tmdbId: 194 },
  { title: 'Pan\'s Labyrinth', date: '10-11', year: 2006, tmdbId: 1417 },
];

function getTodayFilm() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${month}-${day}`;

  // Check for exact date match first
  const exact = CINEMA_HISTORY.find(f => f.date === today);
  if (exact) return exact;

  // Otherwise pick based on day of year for consistency
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return CINEMA_HISTORY[dayOfYear % CINEMA_HISTORY.length];
}

// ─── FILM STRIP ───────────────────────────────────────────────────
function FilmStrip({ movies, onMovieClick }) {
  const stripRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef(null);
  const posRef = useRef(0);
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || movies.length === 0) return;

    function animate() {
      if (!isPaused) {
        posRef.current -= 0.5;
        const totalWidth = strip.scrollWidth / 2;
        if (Math.abs(posRef.current) >= totalWidth) {
          posRef.current = 0;
        }
        strip.style.transform = `translateX(${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [movies, isPaused]);

  const doubled = [...movies, ...movies];

  return (
    <div style={{
      overflow: 'hidden',
      position: 'relative',
      padding: '2rem 0',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
    }}>
      {/* Film strip holes top */}
      <div style={{
        position: 'absolute', top: '6px', left: 0, right: 0,
        display: 'flex', gap: '2rem', padding: '0 1rem',
        pointerEvents: 'none',
      }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            width: '12px', height: '8px', flexShrink: 0,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '1px',
          }} />
        ))}
      </div>

      {/* Film strip holes bottom */}
      <div style={{
        position: 'absolute', bottom: '6px', left: 0, right: 0,
        display: 'flex', gap: '2rem', padding: '0 1rem',
        pointerEvents: 'none',
      }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            width: '12px', height: '8px', flexShrink: 0,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '1px',
          }} />
        ))}
      </div>

      {/* Scrolling posters */}
      <div
        ref={stripRef}
        style={{
          display: 'flex', gap: '0.5rem',
          width: 'max-content', willChange: 'transform',
        }}
      >
        {doubled.map((movie, i) => (
          <div
            key={`${movie.id}-${i}`}
            onClick={() => onMovieClick(movie)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              width: '80px', height: '120px', flexShrink: 0,
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              transition: 'all 0.3s',
            }}
            onMouseEnterCapture={e => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.zIndex = '10';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)';
            }}
            onMouseLeaveCapture={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.zIndex = '1';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {movie.poster_path ? (
              <img
                src={`${IMG_BASE}${movie.poster_path}`}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'var(--card)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.5rem',
              }}>🎬</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SPOTLIGHT ────────────────────────────────────────────────────
function SpotlightOfTheDay({ setTab }) {
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const { whispers, fetchWhisper } = useWhisper();
  const todayFilm = getTodayFilm();
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await tmdbFetch(`/movie/${todayFilm.tmdbId}`);
        setFilm(data);
        fetchWhisper(data);
      } catch {
        setLoading(false);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
      Loading today's spotlight…
    </div>
  );

  if (!film) return null;

  const whisper = whispers[film.id];
  const backdropUrl = film.backdrop_path ? `${BACKDROP_BASE}${film.backdrop_path}` : null;

  return (
    <>
      <div style={{
        position: 'relative', overflow: 'hidden',
        margin: '0', minHeight: '420px',
        display: 'flex', alignItems: 'flex-end',
      }}>
        {/* Backdrop */}
        {backdropUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.35)',
          }} />
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.4) 60%, rgba(8,8,8,0.2) 100%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '3rem', width: '100%' }}>

          {/* Eyebrow */}
          <div style={{
            fontSize: '0.58rem', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'var(--gold)',
            marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{ width: '5px', height: '5px', background: 'var(--gold)', borderRadius: '50%', animation: 'pulse 1.8s infinite' }} />
            On This Day in Cinema · {todayFilm.year}
          </div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Poster */}
            {film.poster_path && (
              <img
                src={`${IMG_BASE}${film.poster_path}`}
                alt={film.title}
                style={{ width: '100px', height: '150px', objectFit: 'cover', border: '2px solid rgba(201,168,76,0.4)', flexShrink: 0 }}
              />
            )}

            <div style={{ flex: 1 }}>
              {/* Title */}
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 900, color: 'var(--cream)',
                lineHeight: 1, marginBottom: '0.5rem',
              }}>{film.title}</h2>

              {/* Meta */}
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                {film.release_date?.slice(0, 4)}
                {film.runtime ? ` · ${film.runtime} min` : ''}
                {` · ★ ${film.vote_average?.toFixed(1)}`}
                {film.genres?.length > 0 ? ` · ${film.genres.slice(0, 2).map(g => g.name).join(', ')}` : ''}
              </div>

              {/* Whisper */}
              {whisper && (
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic', color: 'var(--gold2)',
                  fontSize: '1.1rem', marginBottom: '1rem',
                  borderLeft: '2px solid var(--gold)', paddingLeft: '0.75rem',
                }}>"{whisper}"</div>
              )}

              {/* Overview */}
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.95rem', color: 'var(--muted)',
                fontStyle: 'italic', lineHeight: 1.6,
                maxWidth: '600px', marginBottom: '1.25rem',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{film.overview}</p>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setModal(film)}
                  style={{
                    background: 'var(--gold)', color: 'var(--bg)', border: 'none',
                    fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 500,
                  }}>
                  ▶ Trailer + Info
                </button>
                <button
                  onClick={() => setTab('discussion')}
                  style={{
                    background: 'none', color: 'var(--gold)',
                    border: '1px solid rgba(201,168,76,0.4)',
                    fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    padding: '0.75rem 1.5rem', cursor: 'pointer',
                  }}>
                  💬 Discuss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <MovieModal
          movie={modal}
          whisper={whispers[modal?.id]}
          onClose={() => setModal(null)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────
function Home({ setTab }) {
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [stripMovies, setStripMovies] = useState([]);
  const [modal, setModal] = useState(null);
  const { whispers, fetchWhisper } = useWhisper();
// eslint-disable-next-line react-hooks/exhaustive-deps
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
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function loadStrip() {
      try {
        const data = await getPopularMovies();
        setStripMovies(data);
      } catch { }
    }
    loadStrip();
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{ padding: '5.5rem 3rem 3.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem' }}>
          ✦ The last shot of your day, sorted ✦
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3rem, 9vw, 6.5rem)',
          fontWeight: 900, lineHeight: 0.93,
          color: 'var(--cream)', marginBottom: '1.5rem',
        }}>
          Cinema<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Reimagined</em>
        </h1>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.15rem', color: 'var(--muted)',
          fontStyle: 'italic', maxWidth: '440px',
          margin: '0 auto 1.5rem', lineHeight: 1.6,
        }}>
          Discover films worth remembering.
        </p>

        {/* Rotating Dialogue */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic', fontSize: '1rem',
          color: 'var(--muted)', marginBottom: '2.5rem',
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
              background: 'var(--gold)', color: 'var(--bg)', border: 'none',
              fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '0.85rem 2.2rem', cursor: 'pointer', fontWeight: 500,
            }}>
            Enter the Time Machine
          </button>
          <button
            onClick={() => setTab('tonight')}
            style={{
              background: 'none', color: 'var(--gold)',
              border: '1px solid rgba(201,168,76,0.4)',
              fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '0.85rem 2.2rem', cursor: 'pointer',
            }}>
            What to Watch Tonight
          </button>
        </div>
      </div>

      {/* Spotlight of the Day */}
      <SpotlightOfTheDay setTab={setTab} />

      {/* Film Strip */}
      {stripMovies.length > 0 && (
        <FilmStrip
          movies={stripMovies}
          onMovieClick={movie => setModal(movie)}
        />
      )}

      {/* Footer */}
      <div style={{
        padding: '3rem', textAlign: 'center',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.14em', lineHeight: 2 }}>
          "That's a wrap — it's a Martini." <br />
          Powered by TMDB · Gemini AI · Built for cinephiles
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <MovieModal
          movie={modal}
          whisper={whispers[modal?.id]}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Home;