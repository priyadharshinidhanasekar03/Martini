import React, { useState } from 'react';
import './index.css';
import Header from './components/layout/Header';
import Home from './pages/Home';
import TimeMachine from './pages/TimeMachine';
import TonightQuiz from './pages/TonightQuiz';
import Discover from './pages/Discover';
import Discussion from './pages/Discussion';

function App() {
  const [tab, setTab] = useState('home');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header tab={tab} setTab={setTab} />
      {tab === 'home'       && <Home setTab={setTab} />}
      {tab === 'time'       && <TimeMachine />}
      {tab === 'tonight'    && <TonightQuiz />}
      {tab === 'discover'   && <Discover />}
      {tab === 'discussion' && <Discussion />}
    </div>
  );
}

export default App;