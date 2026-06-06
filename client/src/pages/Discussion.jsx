import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../api/supabase';
import { searchMovies, IMG_BASE } from '../api/tmdb';

const POST_TYPES = [
  { id: 'hot_take', label: '🔥 Hot Take', desc: 'Unpopular opinion incoming...' },
  { id: 'theory', label: '🧠 Theory', desc: 'Hear me out on this...' },
  { id: 'emotional_damage', label: '💀 Emotional Damage', desc: 'I was not prepared for...' },
  { id: 'hidden_gem', label: '💎 Hidden Gem', desc: 'Nobody talks about the scene where...' },
  { id: 'first_watch', label: '👁️ First Watch', desc: 'Just watched. Still processing.' },
  { id: 'rewatch', label: '🔁 Rewatch Club', desc: 'Third time watching and I just noticed...' },
];

const REACTIONS = [
  { type: 'cinema', emoji: '🎞️', label: 'This is cinema' },
  { type: 'soul', emoji: '💀', label: 'Felt this' },
  { type: 'fire', emoji: '🔥', label: 'Controversial but correct' },
  { type: 'brain', emoji: '🧠', label: 'Never noticed' },
  { type: 'martini', emoji: '🍸', label: 'Martini approved' },
];

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── REPLY THREAD ─────────────────────────────────────────────────
function ReplyThread({ postId, userName }) {
  const [replies, setReplies] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReplies();
    const channel = supabase
      .channel(`replies:${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'replies', filter: `post_id=eq.${postId}` },
        payload => setReplies(r => [...r, payload.new]))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [postId]);

  async function fetchReplies() {
    setLoading(true);
    const { data } = await supabase
      .from('replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setReplies(data || []);
    setLoading(false);
  }

  async function submitReply() {
    if (!content.trim()) return;
    setSubmitting(true);
    await supabase.from('replies').insert({
      post_id: postId,
      user_name: userName,
      content: content.trim(),
    });
    setContent('');
    setSubmitting(false);
  }

  return (
    <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
      {loading ? (
        <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>Loading replies...</div>
      ) : (
        replies.map(r => (
          <div key={r.id} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--gold)', fontFamily: "'DM Mono', monospace" }}>{r.user_name}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{timeAgo(r.created_at)}</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.5 }}>
              {r.content}
            </div>
          </div>
        ))
      )}

      {/* Reply Input */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <input
          style={{
            flex: 1, background: 'var(--surface)',
            border: '1px solid var(--border)', color: 'var(--cream)',
            fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
            padding: '0.5rem 0.75rem', outline: 'none',
          }}
          placeholder="Write a reply..."
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitReply()}
        />
        <button
          onClick={submitReply}
          disabled={submitting || !content.trim()}
          style={{
            background: 'var(--gold)', color: 'var(--bg)',
            border: 'none', fontFamily: "'DM Mono', monospace",
            fontSize: '0.6rem', letterSpacing: '0.1em',
            padding: '0.5rem 1rem', cursor: 'pointer',
            opacity: !content.trim() ? 0.4 : 1,
          }}>
          Reply
        </button>
      </div>
    </div>
  );
}

// ─── POST CARD ─────────────────────────────────────────────────────
function PostCard({ post, userName }) {
  const [showReplies, setShowReplies] = useState(false);
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState([]);

  const postType = POST_TYPES.find(t => t.id === post.post_type);

  useEffect(() => {
    fetchReactions();
  }, [post.id]);

  async function fetchReactions() {
    const { data } = await supabase
      .from('reactions')
      .select('*')
      .eq('post_id', post.id);

    const counts = {};
    const userR = [];
    (data || []).forEach(r => {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
      if (r.user_name === userName) userR.push(r.reaction_type);
    });
    setReactions(counts);
    setUserReactions(userR);
  }

  async function toggleReaction(type) {
    if (userReactions.includes(type)) {
      await supabase.from('reactions')
        .delete()
        .eq('post_id', post.id)
        .eq('user_name', userName)
        .eq('reaction_type', type);
      setUserReactions(r => r.filter(t => t !== type));
      setReactions(r => ({ ...r, [type]: Math.max(0, (r[type] || 0) - 1) }));
    } else {
      await supabase.from('reactions').insert({
        post_id: post.id,
        user_name: userName,
        reaction_type: type,
      });
      setUserReactions(r => [...r, type]);
      setReactions(r => ({ ...r, [type]: (r[type] || 0) + 1 }));
    }
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      padding: '1.5rem',
      marginBottom: '1rem',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Post Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.2)',
          color: 'var(--gold)', fontSize: '0.6rem',
          letterSpacing: '0.1em', padding: '0.2rem 0.6rem',
        }}>
          {postType?.label || post.post_type}
        </span>
        <span style={{ fontSize: '0.62rem', color: 'var(--gold)', fontFamily: "'DM Mono', monospace" }}>
          {post.user_name}
        </span>
        <span style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Post Content */}
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.05rem', color: 'var(--text)',
        lineHeight: 1.6, marginBottom: '1rem',
      }}>
        {post.content}
      </div>

      {/* Reactions */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {REACTIONS.map(r => (
          <button
            key={r.type}
            onClick={() => toggleReaction(r.type)}
            title={r.label}
            style={{
              background: userReactions.includes(r.type) ? 'rgba(201,168,76,0.15)' : 'var(--surface)',
              border: `1px solid ${userReactions.includes(r.type) ? 'rgba(201,168,76,0.5)' : 'var(--border)'}`,
              color: userReactions.includes(r.type) ? 'var(--gold)' : 'var(--muted)',
              fontSize: '0.7rem', padding: '0.25rem 0.6rem',
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            {r.emoji} {reactions[r.type] > 0 && <span style={{ fontSize: '0.6rem' }}>{reactions[r.type]}</span>}
          </button>
        ))}
      </div>

      {/* Reply Toggle */}
      <button
        onClick={() => setShowReplies(s => !s)}
        style={{
          background: 'none', border: 'none',
          color: 'var(--muted)', fontSize: '0.6rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: 'pointer', fontFamily: "'DM Mono', monospace",
          padding: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        {showReplies ? 'Hide Replies' : 'Reply'}
      </button>

      {showReplies && <ReplyThread postId={post.id} userName={userName} />}
    </div>
  );
}

// ─── DISCUSSION ROOM ──────────────────────────────────────────────
function DiscussionRoom({ movie, userName, onBack }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postType, setPostType] = useState('hot_take');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel(`posts:${movie.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts', filter: `movie_id=eq.${movie.id}` },
        payload => setPosts(p => [payload.new, ...p]))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [movie.id]);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('movie_id', movie.id)
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  async function submitPost() {
    if (!content.trim()) return;
    setSubmitting(true);
    await supabase.from('posts').insert({
      movie_id: String(movie.id),
      movie_title: movie.title,
      user_name: userName,
      post_type: postType,
      content: content.trim(),
    });
    setContent('');
    setSubmitting(false);
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.post_type === filter);

  return (
    <div>
      {/* Room Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {movie.poster_path && (
          <img src={`${IMG_BASE}${movie.poster_path}`} alt={movie.title}
            style={{ width: '48px', height: '72px', objectFit: 'cover', border: '1px solid var(--border)' }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--cream)' }}>
            {movie.title}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Discussion Room · {posts.length} posts
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--muted)', fontFamily: "'DM Mono', monospace",
            fontSize: '0.6rem', padding: '0.4rem 0.8rem',
            cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
          ← Back
        </button>
      </div>

      {/* Post Composer */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          Post as {userName}
        </div>

        {/* Post Type Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {POST_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setPostType(t.id)}
              style={{
                background: postType === t.id ? 'rgba(201,168,76,0.15)' : 'none',
                border: `1px solid ${postType === t.id ? 'var(--gold)' : 'var(--border)'}`,
                color: postType === t.id ? 'var(--gold)' : 'var(--muted)',
                fontFamily: "'DM Mono', monospace", fontSize: '0.58rem',
                letterSpacing: '0.08em', padding: '0.3rem 0.7rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Post Input */}
        <textarea
          style={{
            width: '100%', background: 'var(--surface)',
            border: '1px solid var(--border)', color: 'var(--cream)',
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem',
            padding: '0.75rem', outline: 'none', resize: 'vertical',
            minHeight: '80px', lineHeight: 1.6,
          }}
          placeholder={POST_TYPES.find(t => t.id === postType)?.desc || 'Write something...'}
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <button
            onClick={submitPost}
            disabled={submitting || !content.trim()}
            style={{
              background: 'var(--gold)', color: 'var(--bg)', border: 'none',
              fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '0.65rem 1.5rem', cursor: 'pointer', fontWeight: 500,
              opacity: !content.trim() ? 0.4 : 1,
            }}>
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            background: filter === 'all' ? 'var(--gold)' : 'none',
            border: `1px solid ${filter === 'all' ? 'var(--gold)' : 'var(--border)'}`,
            color: filter === 'all' ? 'var(--bg)' : 'var(--muted)',
            fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
            letterSpacing: '0.1em', padding: '0.35rem 0.8rem', cursor: 'pointer',
          }}>All</button>
        {POST_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            style={{
              background: filter === t.id ? 'var(--gold)' : 'none',
              border: `1px solid ${filter === t.id ? 'var(--gold)' : 'var(--border)'}`,
              color: filter === t.id ? 'var(--bg)' : 'var(--muted)',
              fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
              letterSpacing: '0.1em', padding: '0.35rem 0.8rem', cursor: 'pointer',
            }}>{t.label}</button>
        ))}
      </div>

      {/* Posts */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Loading discussions…
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
            No posts yet. Be the first to say something.
          </div>
        </div>
      )}

      {!loading && filtered.map(post => (
        <PostCard key={post.id} post={post} userName={userName} />
      ))}
    </div>
  );
}

// ─── MOVIE SEARCH FOR DISCUSSION ──────────────────────────────────
function MovieSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    setQuery(e.target.value);
    if (e.target.value.length < 2) { setResults([]); return; }
    setLoading(true);
    const data = await searchMovies(e.target.value);
    setResults(data.slice(0, 6));
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.9rem', fontWeight: 700, color: 'var(--cream)' }}>
          Discussion <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Rooms</em>
        </h2>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem' }}>
        Every film has a room. Find yours.
      </p>

      <div style={{ position: 'relative', maxWidth: '500px', marginBottom: '2rem' }}>
        <input
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--cream)', fontFamily: "'DM Mono', monospace",
            fontSize: '0.72rem', padding: '0.85rem 1rem',
            width: '100%', outline: 'none',
          }}
          placeholder="Search a movie to discuss..."
          value={query}
          onChange={handleSearch}
        />

        {loading && (
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--muted)' }}>
            ...
          </div>
        )}

        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', zIndex: 10 }}>
            {results.map(m => (
              <div
                key={m.id}
                onClick={() => { onSelect(m); setQuery(''); setResults([]); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {m.poster_path && (
                  <img src={`${IMG_BASE}${m.poster_path}`} alt={m.title}
                    style={{ width: '32px', height: '48px', objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--cream)' }}>{m.title}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{m.release_date?.slice(0, 4)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Types Legend */}
      <div style={{ marginTop: '3rem' }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
          Post Types in Every Room
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {POST_TYPES.map(t => (
            <div key={t.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '1rem' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.3rem' }}>{t.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--muted)' }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reactions Legend */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
          Reactions
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {REACTIONS.map(r => (
            <div key={r.type} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--muted)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {r.emoji} {r.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── USERNAME SETUP ────────────────────────────────────────────────
function UsernameSetup({ onSet }) {
  const [name, setName] = useState('');

  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍸</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--cream)', marginBottom: '0.5rem' }}>
        Who are you, cinephile?
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Pick a name to join the discussion rooms
      </div>
      <input
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--cream)', fontFamily: "'DM Mono', monospace",
          fontSize: '0.8rem', padding: '0.85rem 1rem',
          width: '100%', outline: 'none', marginBottom: '1rem',
          textAlign: 'center',
        }}
        placeholder="your cinephile name..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && onSet(name.trim())}
      />
      <button
        onClick={() => name.trim() && onSet(name.trim())}
        disabled={!name.trim()}
        style={{
          background: 'var(--gold)', color: 'var(--bg)', border: 'none',
          fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          padding: '0.85rem 2.5rem', cursor: 'pointer', fontWeight: 500,
          opacity: !name.trim() ? 0.4 : 1,
        }}>
        Enter Martini
      </button>
    </div>
  );
}

// ─── MAIN DISCUSSION PAGE ─────────────────────────────────────────
function Discussion() {
  const [userName, setUserName] = useState(() => localStorage.getItem('martini_username') || '');
  const [selectedMovie, setSelectedMovie] = useState(null);

  function handleSetName(name) {
    localStorage.setItem('martini_username', name);
    setUserName(name);
  }

  function handleSelectMovie(movie) {
    setSelectedMovie(movie);
  }

  return (
    <div style={{ padding: '3.5rem 3rem' }}>
      {!userName ? (
        <UsernameSetup onSet={handleSetName} />
      ) : selectedMovie ? (
        <DiscussionRoom
          movie={selectedMovie}
          userName={userName}
          onBack={() => setSelectedMovie(null)}
        />
      ) : (
        <MovieSearch onSelect={handleSelectMovie} />
      )}
    </div>
  );
}

export default Discussion;