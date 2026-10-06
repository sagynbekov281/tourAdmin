import { useState } from 'react';

const toForm = (fields, item) => {
  const o = {};
  fields.forEach(([k, , t]) => {
    const v = item[k];
    o[k] = t === 'lines' ? (v || []).join('\n') : t === 'list' ? (v || []).join(', ')
      : t === 'date' ? (v ? String(v).slice(0, 10) : '') : t === 'checkbox' ? !!v : (v ?? '');
  });
  return o;
};
const toBody = (fields, f) => {
  const b = {};
  fields.forEach(([k, , t]) => {
    const v = f[k];
    b[k] = t === 'lines' ? v.split('\n').map((s) => s.trim()).filter(Boolean)
      : t === 'list' ? v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean) : v;
  });
  return b;
};

export default function Modal({ title, fields, item, onSave, onClose }) {
  const [f, setF] = useState(() => toForm(fields, item || { active: true, order: 0, price: 0, discountPercent: 0 }));
  const [err, setErr] = useState('');
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = async () => { try { await onSave(toBody(fields, f)); } catch (e) { setErr(e.message); } };
  return (
    <div className="modal">
      <div className="box">
        <h2>{title}</h2>
        {fields.map(([k, label, type, opts]) => type === 'checkbox' ? (
          <label key={k} className="chk"><input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} /> {label}</label>
        ) : (
          <label key={k}>{label}
            {type === 'textarea' || type === 'lines' ? <textarea rows={type === 'lines' ? 5 : 3} value={f[k]} onChange={(e) => set(k, e.target.value)} />
              : type === 'select' ? <select value={f[k]} onChange={(e) => set(k, e.target.value)}>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
              : <input type={type === 'list' ? 'text' : type} value={f[k]} onChange={(e) => set(k, e.target.value)} />}
          </label>
        ))}
        <div className="err">{err}</div>
        <div className="row"><button onClick={save}>Сохранить</button><button className="secondary" onClick={onClose}>Отмена</button></div>
      </div>
    </div>
  );
}
