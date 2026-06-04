import React, { useState } from 'react';
import { getMoviesByYear, IMG_BASE } from '../api/tmdb';
import { useWhisper } from '../hooks/useWhisper';
import MovieModal from '../components/movies/MovieModal';

const LANGUAGES = [
  { code: '', label: 'All Cinema' },
  { code: 'en', label: 'Hollywood' },
  { code: 'hi', label: 'Bollywood' },
  { code: 'ko', label: 'Korean' },
  { code: 'fr', label: 'French' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ta', label: 'Tamil' },
];

const ERA_BADGES = {
  1902: 'A Trip to the Moon — Cinema Begins',
  1915: 'Birth of Feature Films',
  1920: 'The Golden Age of Silent Cinema',
  1925: 'Battleship Potemkin Year',
  1927: 'The Jazz Singer — Sound Arrives',
  1931: 'Universal Monsters Begin',
  1933: 'King Kong Terrified the World',
  1939: 'Gone With The Wind Year',
  1940: 'Hitchcock Comes to Hollywood',
  1941: 'Citizen Kane Changed Everything',
  1942: "Casablanca — Here's Looking at You",
  1946: "It's a Wonderful Life Year",
  1950: 'Rashomon Opened the East to West',
  1954: "Seven Samurai — Kurosawa's Peak",
  1955: 'Rebel Without a Cause Year',
  1960: 'Psycho Invented the Thriller',
  1961: 'West Side Story Danced',
  1962: 'Lawrence of Arabia — Epic Scale',
  1963: 'The Great Escape Year',
  1967: 'The Graduate Changed Youth Cinema',
  1968: '2001 Broke Space and Time',
  1969: 'Easy Rider — New Hollywood Begins',
  1971: 'A Clockwork Orange Disturbed the World',
  1972: 'The Godfather Era',
  1973: 'The Exorcist Scared Everyone',
  1974: 'Chinatown — Neo Noir Peak',
  1975: 'Jaws Invented the Blockbuster',
  1976: "Taxi Driver — Scorsese's Masterpiece",
  1977: 'A Galaxy Far Far Away',
  1978: 'The Deer Hunter Won Everything',
  1979: 'Apocalypse Now — War Reimagined',
  1980: "The Shining — Kubrick's Horror",
  1982: 'E.T. Made Everyone Cry',
  1983: 'Scarface — Say Hello to My Little Friend',
  1984: "The Terminator — I'll Be Back",
  1985: 'Back to the Future Year',
  1986: 'Aliens — Game Over Man',
  1987: 'Full Metal Jacket Year',
  1988: 'Akira Changed Animation Forever',
  1989: 'Batman Came to Gotham',
  1990: 'Goodfellas — As Far Back as I Can Remember',
  1991: 'Silence of the Lambs Swept Everything',
  1992: 'Reservoir Dogs — Tarantino Arrives',
  1993: "Schindler's List — Cinema at Its Most Important",
  1994: "Cinema's Renaissance Year",
  1995: "Se7en — What's in the Box",
  1996: 'Fargo — Oh Yah',
  1997: 'Titanic Sank and Won Everything',
  1998: 'Saving Private Ryan — War Reimagined',
  1999: 'The Auteur Explosion',
  2000: 'Gladiator — Are You Not Entertained',
  2001: 'Mulholland Drive Confused Everyone Beautifully',
  2002: 'Spirited Away Won the Oscar',
  2003: 'Lord of the Rings Completed the Trilogy',
  2004: 'Eternal Sunshine of the Spotless Mind Year',
  2005: 'Brokeback Mountain Broke Hearts',
  2006: 'The Departed — Scorsese Finally Won',
  2007: 'There Will Be Blood — I Drink It Up',
  2008: 'The Dark Knight Moment',
  2009: 'Avatar Changed Visual Effects Forever',
  2010: 'Inception Broke Brains',
  2011: 'The Artist Brought Back Silent Cinema',
  2012: 'Django Unchained Year',
  2013: 'Her Made Everyone Feel Lonely',
  2014: 'Interstellar Broke Time',
  2015: 'Mad Max Fury Road — WITNESS ME',
  2016: 'Moonlight — A Beautiful Quiet Revolution',
  2017: 'Get Out Changed Horror Forever',
  2018: "Roma — Cuarón's Masterpiece",
  2019: 'Parasite Changed Everything',
  2020: 'Cinema Survived a Pandemic',
  2021: 'The Power of the Dog Year',
  2022: 'Everything Everywhere All at Once',
  2023: 'Oppenheimer — Now I Am Become Cinema',
  2024: 'Dune Part Two Completed the Vision',
  2025: 'The Future of Cinema Begins',
};

const DIRECTOR_QUOTES = [
  { quote: 'Cinema is a mirror by which we often see ourselves.', author: 'Martin Scorsese' },
  { quote: 'A film is never really good unless the camera is an eye in the head of a poet.', author: 'Orson Welles' },
  { quote: 'I steal from every movie ever made.', author: 'Quentin Tarantino' },
  { quote: 'Film is life with the dull bits cut out.', author: 'Alfred Hitchcock' },
  { quote: 'If it can be written, or thought, it can be filmed.', author: 'Stanley Kubrick' },
];

function randomQuote() {
  return DIRECTOR_QUOTES[Math.floor(Math.random() * DIRECTOR_QUOTES.length)];
}

function MovieCard({ movie, whispers, fetchWhisper, onExpand }) {
  const [hovered, setHovered] = useState(false);
  const whisper = whispers[movie.id];
  const year = movie.release_date?.slice(0, 4) || '—';
  const lang = movie.original_language?.toUpperCase();

  async function handleMouseEnter() {
    setHovered(true);
    if (!whispers[movie.id]) await fetchWhisper(movie);
  }

  return (
    <div
      style={{
        background: 'var(--card)',
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.5)' : 'var(--border)'}`,
        cursor: 'pointer',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onExpand && onExpand(movie)}
    >
      {lang && (
        <span style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          background: 'rgba(8,8,8,0.85)', border: '1px solid var(--border)',
          color: 'var(--muted)', fontSize: '0.48rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '0.15rem 0.4rem', zIndex: 2,
        }}>{lang}</span>
      )}

      {movie.poster_path ? (
        <img
          src={`${IMG_BASE}${movie.poster_path}`}
          alt={movie.title}
          loading="lazy"
          style={{
            width: '100%', aspectRatio: '2/3',
            objectFit: 'cover', display: 'block',
            filter: hovered ? 'brightness(0.5)' : 'brightness(1)',
            transition: 'filter 0.3s',
          }}
        />
      ) : (
        <div style={{
          width: '100%', aspectRatio: '2/3',
          background: 'var(--surface)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', color: 'var(--border)',
        }}>🎬</div>
      )}

      {/* Whisper Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '1rem',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.35s ease',
        background: 'linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.6) 60%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        {whisper ? (
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic', fontSize: '0.85rem',
            color: 'var(--gold2)', textAlign: 'center',
            lineHeight: 1.5, letterSpacing: '0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            marginBottom: '0.5rem',
          }}>"{whisper}"</div>
        ) : (
          <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>...</div>
        )}
        <div style={{
          fontSize: '0.55rem', color: 'var(--gold)',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          opacity: 0.8,
        }}>click for details</div>
      </div>

      <div style={{ padding: '0.7rem 0.75rem' }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '0.9rem', fontWeight: 600,
          color: 'var(--cream)', lineHeight: 1.3,
          marginBottom: '0.3rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{movie.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.58rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>{year}</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--gold)' }}>★ {movie.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

function TimeMachine() {
  const [year, setYear] = useState(1994);
  const [lang, setLang] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [quote] = useState(randomQuote());
  const [modal, setModal] = useState(null);
  const { whispers, fetchWhisper } = useWhisper();

  const era = ERA_BADGES[year];
  const langLabel = LANGUAGES.find(l => l.code === lang)?.label || 'All Cinema';

  async function fetchMovies() {
    setLoading(true);
    setSearched(true);
    try {
      const data = await getMoviesByYear(year, lang);
      setMovies(data);
    } catch (err) {
      console.error(err);
      setMovies([]);
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: '3.5rem 3rem' }}>

      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.9rem', fontWeight: 700, color: 'var(--cream)' }}>
          Cinematic <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Time Machine</em>
        </h2>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Year Display */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(4.5rem, 14vw, 9rem)',
          fontWeight: 900, color: 'transparent',
          WebkitTextStroke: '1.5px var(--gold)',
          lineHeight: 1, letterSpacing: '-0.02em',
        }}>{year}</div>

        {era && (
          <div style={{
            display: 'inline-block', marginTop: '0.5rem',
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.25)',
            color: 'var(--gold)', fontSize: '0.6rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            padding: '0.3rem 1rem',
          }}>✦ {era} ✦</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => setYear(y => Math.max(1900, y - 1))}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--gold)', fontSize: '1rem', width: '38px', height: '38px', cursor: 'pointer' }}>‹</button>
          <input
            type="range" min="1900" max="2025" value={year}
            onChange={e => setYear(+e.target.value)}
            style={{ width: '260px', accentColor: 'var(--gold)', cursor: 'pointer' }}
          />
          <button
            onClick={() => setYear(y => Math.min(2025, y + 1))}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--gold)', fontSize: '1rem', width: '38px', height: '38px', cursor: 'pointer' }}>›</button>
        </div>
      </div>

      {/* Language Filter */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'center' }}>
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => setLang(l.code)}
            style={{
              background: lang === l.code ? 'var(--gold)' : 'none',
              border: `1px solid ${lang === l.code ? 'var(--gold)' : 'var(--border)'}`,
              color: lang === l.code ? 'var(--bg)' : 'var(--muted)',
              fontFamily: "'DM Mono', monospace", fontSize: '0.62rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0.35rem 0.9rem', cursor: 'pointer', transition: 'all 0.2s',
            }}>{l.label}</button>
        ))}
      </div>

      {/* Travel Button */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <button onClick={fetchMovies}
          style={{
            background: 'var(--gold)', color: 'var(--bg)', border: 'none',
            fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            padding: '0.85rem 2.2rem', cursor: 'pointer', fontWeight: 500,
          }}>
          Travel to {year} · {langLabel}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎞</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Travelling to {year}…
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1rem', color: 'var(--muted)' }}>
            "{quote.quote}"
          </div>
          <div style={{ fontSize: '0.58rem', color: 'var(--border)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
            — {quote.author}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && searched && movies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🎭</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
            I'm gonna make him an offer he can't refuse — try another year.
          </div>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && movies.length > 0 && (
        <>
          <p style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            {movies.length} films · {year} · {langLabel} · click any film for details
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1.25rem' }}>
            {movies.map(m => (
              <MovieCard
                key={m.id}
                movie={m}
                whispers={whispers}
                fetchWhisper={fetchWhisper}
                onExpand={setModal}
              />
            ))}
          </div>
        </>
      )}

      {/* Initial Empty State */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🕰️</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
            Pick a year. Pick a world. Begin the journey.
          </div>
        </div>
      )}

      {/* Movie Modal */}
      {modal && (
        <MovieModal
          movie={modal}
          whisper={whispers[modal.id]}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default TimeMachine;