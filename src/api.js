const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const getToken = () => localStorage.getItem('admin_token') || '';
export const setToken = (t) => (t ? localStorage.setItem('admin_token', t) : localStorage.removeItem('admin_token'));

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (getToken()) headers.Authorization = 'Bearer ' + getToken();
  const res = await fetch(API + path, { ...opts, headers, cache: 'no-store' });
  let body = {};
  try { body = await res.json(); } catch (e) {}
  if (res.status === 401 && path !== '/api/admin/login') {
    setToken('');
    window.dispatchEvent(new Event('admin-logout'));
    throw new Error('Сессия истекла, войдите снова');
  }
  if (!res.ok || body.success === false)
    throw new Error(body.error || (body.errors || []).join(', ') || 'Ошибка ' + res.status);
  return body;
}