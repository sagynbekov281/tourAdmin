import { useEffect, useState } from 'react';
import { api } from '../api';
import Dialog from '../components/Dialog';

const STATUS = { pending: 'ожидает', approved: 'одобрена', rejected: 'отклонена' };
const waLink = (phone, text) => 'https://wa.me/' + String(phone).replace(/\D/g, '') + '?text=' + encodeURIComponent(text);

export default function Bookings() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('Загрузка...');
  const [myWa, setMyWa] = useState(localStorage.getItem('my_wa') || '');
  const [openWa, setOpenWa] = useState(localStorage.getItem('open_wa') !== 'false');
  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState('');
  const [info, setInfo] = useState('');

  const load = async () => {
    try { const r = await api('/api/bookings'); setList(r.bookings || []); setMsg(''); } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { load(); }, []);

  const approve = async (a) => {
    const win = openWa ? window.open('', '_blank') : null;
    try {
      const r = await api(`/api/bookings/${a._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) });
      if (win) win.location.href = waLink(a.phone, `Здравствуйте, ${a.name}! Ваша бронь тура «${a.tour}» в KHAN - TENGRI подтверждена. Мы свяжемся с вами, чтобы согласовать детали поездки.`);
      if (r.sms?.attempted) setInfo(r.sms.ok ? 'SMS клиенту отправлена.' : 'SMS НЕ отправилась: ' + r.sms.error);
      load();
    } catch (e) { win?.close(); setInfo(e.message); }
  };
  const reject = async (a) => {
    try { await api(`/api/bookings/${a._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }); load(); }
    catch (e) { setInfo(e.message); }
  };

  const doRemove = async () => {
    setDelBusy(true); setDelErr('');
    try {
      await api('/api/bookings/' + del._id, { method: 'DELETE' });
      const id = del._id;
      setList((l) => l.filter((x) => x._id !== id));
      setDel(null);
    } catch (e) { setDelErr(e.message); }
    finally { setDelBusy(false); }
  };

  const toClient = (a) => window.open(waLink(a.phone, `Здравствуйте, ${a.name}! Это KHAN - TENGRI. Вы оставили заявку на тур «${a.tour}». Когда вам удобно поговорить?`), '_blank');
  const toMe = (a) => {
    if (!myWa.trim()) return setInfo('Впишите свой номер WhatsApp в поле сверху');
    window.open(waLink(myWa, `Бронь KHAN - TENGRI\nИмя: ${a.name}\nТелефон: +${a.phone}\nТур: ${a.tour}\nЧеловек: ${a.peopleCount}` + (a.message ? `\nСообщение: ${a.message}` : '')), '_blank');
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
                {decided && <button className="danger" onClick={() => { setDelErr(''); setDel(a); }}>🗑 Удалить</button>}
              </td>
            </tr>); })}</tbody>
        </table></div>
      )}

      {del && (
        <Dialog
          title="Удалить бронь?"
          text={`Бронь ${del.name} на тур «${del.tour}» будет удалена безвозвратно.`}
          busy={delBusy} error={delErr}
          onConfirm={doRemove} onClose={() => setDel(null)}
        />
      )}
      {info && <Dialog text={info} onClose={() => setInfo('')} />}
    </>
  );
}