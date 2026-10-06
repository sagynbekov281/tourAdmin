import { useEffect, useState } from 'react';
import { api } from '../api';

const STATUS = { pending: 'ожидает', approved: 'одобрена', rejected: 'отклонена' };
const waLink = (phone, text) => 'https://wa.me/' + String(phone).replace(/\D/g, '') + '?text=' + encodeURIComponent(text);

export default function Bookings() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('Загрузка...');
  const [myWa, setMyWa] = useState(localStorage.getItem('my_wa') || '');
  const [openWa, setOpenWa] = useState(localStorage.getItem('open_wa') !== 'false');

  const load = async () => {
    try { const r = await api('/api/bookings'); setList(r.bookings || []); setMsg(''); } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { load(); }, []);

  const approve = async (a) => {
    const win = openWa ? window.open('', '_blank') : null;
    try {
      const r = await api(`/api/bookings/${a._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) });
      if (win) win.location.href = waLink(a.phone, `Здравствуйте, ${a.name}! Ваша бронь тура «${a.tour}» в TourCo подтверждена. Мы свяжемся с вами, чтобы согласовать детали поездки.`);
      if (r.sms?.attempted) alert(r.sms.ok ? 'SMS клиенту отправлена.' : 'SMS НЕ отправилась:\n' + r.sms.error);
      load();
    } catch (e) { win?.close(); alert(e.message); }
  };
  const reject = async (a) => { try { await api(`/api/bookings/${a._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }); load(); } catch (e) { alert(e.message); } };
  const remove = async (a) => { if (!confirm('Удалить эту бронь безвозвратно?')) return; try { await api('/api/bookings/' + a._id, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); } };
  const toClient = (a) => window.open(waLink(a.phone, `Здравствуйте, ${a.name}! Это TourCo. Вы оставили заявку на тур «${a.tour}». Когда вам удобно поговорить?`), '_blank');
  const toMe = (a) => {
    if (!myWa.trim()) return alert('Впишите свой номер WhatsApp в поле сверху');
    window.open(waLink(myWa, `Бронь TourCo\nИмя: ${a.name}\nТелефон: +${a.phone}\nТур: ${a.tour}\nЧеловек: ${a.peopleCount}` + (a.message ? `\nСообщение: ${a.message}` : '')), '_blank');
  };

  return (
    <>
      <div className="bar">
        <input placeholder="Ваш WhatsApp: 996XXXXXXXXX" value={myWa}
          onChange={(e) => { setMyWa(e.target.value); localStorage.setItem('my_wa', e.target.value.trim()); }} />
        <label className="chk"><input type="checkbox" checked={openWa}
          onChange={(e) => { setOpenWa(e.target.checked); localStorage.setItem('open_wa', String(e.target.checked)); }} /> При «Одобрить» открывать WhatsApp клиента</label>
      </div>
      {msg && <p className="muted">{msg}</p>}
      {!msg && !list.length && <div className="empty">Броней пока нет</div>}
      {list.length > 0 && (
        <div className="table-wrap"><table>
          <thead><tr>{['Имя','Телефон','Тур','Статус','Дата',''].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{list.map((a) => { const decided = a.status !== 'pending'; return (
            <tr key={a._id}>
              <td data-label="Имя">{a.name}</td><td data-label="Телефон">+{a.phone}</td><td data-label="Тур">{a.tour}</td>
              <td data-label="Статус"><span className={'badge ' + a.status}>{STATUS[a.status] || a.status}</span></td>
              <td data-label="Дата">{new Date(a.createdAt).toLocaleString('ru-RU')}</td>
              <td className="actions">
                {!decided && <><button onClick={() => approve(a)}>✅ Одобрить</button><button className="secondary" onClick={() => reject(a)}>❌</button></>}
                <button className="wa" onClick={() => toClient(a)}>💬 Клиенту</button>
                <button className="secondary" onClick={() => toMe(a)}>📤 Мне</button>
                {decided && <button className="danger" onClick={() => remove(a)}>🗑 Удалить</button>}
              </td>
            </tr>); })}</tbody>
        </table></div>
      )}
    </>
  );
}
