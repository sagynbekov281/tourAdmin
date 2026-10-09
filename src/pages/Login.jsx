import { useState } from 'react';
import { api, setToken } from '../api';

export default function Login({ onLogin }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const go = async () => {
    setErr('');
    try { const r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: pwd }) }); setToken(r.token); onLogin(); }
    catch (e) {
      setErr(e.message === 'Неверный пароль'
        ? 'Неверный пароль. Сверьте его с ADMIN_PASSWORD в tour-agency-backend/.env и перезапустите backend.'
        : e.message);
    }
  };
  return (
    <div className="login">
      <h1>KHAN - TENGRI</h1>
      <div className="muted">Вход в админ-панель</div>
      <input type="password" placeholder="Пароль" value={pwd} autoComplete="current-password"
        onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} />
      <button onClick={go}>Войти</button>
      <div className="err">{err}</div>
    </div>
  );
}
