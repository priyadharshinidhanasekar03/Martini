import { useState, useRef } from 'react';
import { getKnownWhisper } from '../data/whispers';

const whisperCache = {};

export function useWhisper() {
  const [whispers, setWhispers] = useState({});
  const loadingRef = useRef({});

  async function fetchWhisper(movie) {
    const id = movie.id;

    if (whispers[id]) return whispers[id];

    const known = getKnownWhisper(movie.title);
    if (known) {
      setWhispers(w => ({ ...w, [id]: known }));
      return known;
    }

    if (whisperCache[id]) {
      setWhispers(w => ({ ...w, [id]: whisperCache[id] }));
      return whisperCache[id];
    }

    if (loadingRef.current[id]) return null;
    loadingRef.current[id] = true;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: `You are the witty personality of "Martini" — a cinema app for serious film lovers.

For the movie "${movie.title}" (${movie.release_date?.slice(0, 4) || 'unknown'}), write ONE single line. It should be:
- Maximum 10 words
- Subtly funny, self-aware, or emotionally knowing
- Like a friend who's seen it whispering to you
- NEVER generic like "a must watch"

Reply with ONLY the line. Nothing else.`
          }]
        })
      });
      const data = await res.json();
      const line = data.content?.[0]?.text?.trim().replace(/^"|"$/g, '') || 'A film worth your evening.';
      whisperCache[id] = line;
      setWhispers(w => ({ ...w, [id]: line }));
      return line;
    } catch {
      const fallback = 'A film worth your evening.';
      whisperCache[id] = fallback;
      setWhispers(w => ({ ...w, [id]: fallback }));
      return fallback;
    } finally {
      loadingRef.current[id] = false;
    }
  }

  return { whispers, fetchWhisper };
}