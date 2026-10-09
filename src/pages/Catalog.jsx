import { useEffect, useState } from 'react';
import { api } from '../api';
import { SCHEMA } from '../schema';
import Modal from '../components/Modal';
import Dialog from '../components/Dialog';

const money = (n) => Number(n).toLocaleString('ru-RU') + ' сом';
const Shown = ({ on }) => <span className={'badge ' + (on ? 'on' : 'off')}>{on ? 'на сайте' : 'скрыт'}</span>;

export default function Catalog({ kind }) {
  const S = SCHEMA[kind];
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('Загрузка...');
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState('');
  const [info, setInfo] = useState('');

  const load = async () => {
    try { const r = await api(S.endpoint); setItems(r[S.key] || []); setMsg(''); } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { setItems([]); setMsg('Загрузка...'); setDel(null); load(); }, [kind]);

  const save = async (body) => {
    const id = form.item?._id;
    await api(S.endpoint + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
    setForm(null); load();
  };

  const askRemove = (i) => { setDelErr(''); setDel(i); };
  const doRemove = async () => {
    setDelBusy(true); setDelErr('');
    try {
      await api(S.endpoint + '/' + del._id, { method: 'DELETE' });
      const id = del._id;
      setItems((list) => list.filter((x) => x._id !== id));
      setDel(null);
    } catch (e) { setDelErr(e.message); }
    finally { setDelBusy(false); }
  };

  const seed = async () => { try { await api('/api/admin/seed/' + S.seed, { method: 'POST' }); load(); } catch (e) { setInfo(e.message); } };

  const btns = (i) => (
    <td className="actions">
      <button onClick={() => setForm({ item: i })}>✏️ Изменить</button>
      <button className="danger" onClick={() => askRemove(i)}>🗑 Удалить</button>
    </td>
  );
  const heads = kind === 'courses' ? ['Тур','Цена','Скидка','Места','Статус',''] : ['Имя','Должность','Языки','Статус',''];

  return (
    <>
      <div className="bar">
        <button onClick={() => setForm({ item: null })}>＋ Добавить {S.one}</button>
        {!items.length && !msg && <button className="secondary" onClick={seed}>Загрузить примеры</button>}
      </div>
      {msg && <p className="muted">{msg}</p>}
      {!msg && !items.length && <div className="empty">Список пуст</div>}
      {items.length > 0 && (
        <div className="table-wrap"><table>
          <thead><tr>{heads.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{items.map((i) => kind === 'courses' ? (
            <tr key={i._id}>
              <td data-label="Тур">{i.title}</td>
              <td data-label="Цена">{i.discountActive ? <><s>{money(i.price)}</s> {money(i.finalPrice)}</> : money(i.price)}</td>
              <td data-label="Скидка">{i.discountActive ? <span className="badge sale">-{i.discountPercent}%{i.discountEndsAt ? ' до ' + new Date(i.discountEndsAt).toLocaleDateString('ru-RU') : ''}</span> : '—'}</td>
              <td data-label="Места">{i.totalSeats > 0 ? `${i.seatsLeft} из ${i.totalSeats}` : 'не отслеживаются'}</td>
              <td data-label="Статус"><Shown on={i.active} /></td>{btns(i)}
            </tr>
          ) : (
            <tr key={i._id}>
              <td data-label="Имя">{i.name}</td><td data-label="Должность">{i.role}</td>
              <td data-label="Языки">{(i.languages || []).join(', ')}</td>
              <td data-label="Статус"><Shown on={i.active} /></td>{btns(i)}
            </tr>
          ))}</tbody>
        </table></div>
      )}

      {form && <Modal title={(form.item ? 'Изменить ' : 'Добавить ') + S.one} kind={kind} fields={S.fields} item={form.item} onSave={save} onClose={() => setForm(null)} />}

      {del && (
        <Dialog
          title={`Удалить «${del.title || del.name}»?`}
          text="Это действие нельзя отменить. Запись исчезнет и с сайта."
          busy={delBusy} error={delErr}
          onConfirm={doRemove} onClose={() => setDel(null)}
        />
      )}
      {info && <Dialog text={info} onClose={() => setInfo('')} />}
    </>
  );
}