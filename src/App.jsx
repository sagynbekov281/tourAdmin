import { useEffect, useState } from 'react';
import { getToken, setToken } from './api';
import Login from './pages/Login';
import Bookings from './pages/Bookings';
import Catalog from './pages/Catalog';

const TABS = [['applications','Брони','▤'],['courses','Туры','▧'],['teachers','Гиды','♙']];

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState('applications');
  const [nav, setNav] = useState(false);
  useEffect(() => { const h = () => setAuthed(false); window.addEventListener('admin-logout', h); return () => window.removeEventListener('admin-logout', h); }, []);
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  const logout = () => { setToken(''); setAuthed(false); };
  return (
    <div className={'app-shell' + (nav ? ' nav-open' : '')}>
      <aside className="sidebar">
        <div className="brand">khan-tengti<small>ПАНЕЛЬ УПРАВЛЕНИЯ</small></div>
        <nav className="tabs">{TABS.map(([k, l, ic]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setNav(false); }}><span>{ic}</span>{l}</button>
        ))}</nav>
      </aside>
      <div className="backdrop" onClick={() => setNav(false)} />
      <div className="main-shell">
        <header className="topbar">
          <button className="menu-toggle secondary" onClick={() => setNav(!nav)}>☰</button>
          <button className="secondary" onClick={logout}>Выйти</button>
        </header>
        <main className="main-content">
          <h1>{TABS.find((t) => t[0] === tab)[1]}</h1>
          {tab === 'applications' ? <Bookings /> : <Catalog kind={tab} />}
        </main>
      </div>
    </div>
  );
}
