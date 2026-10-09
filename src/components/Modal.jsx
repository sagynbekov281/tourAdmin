import { useState } from 'react';
import { api } from '../api';
import PhotoEditor from './PhotoEditor';

const toForm = (fields, item) => {
  const form = {};
  fields.forEach(([key, , type]) => {
    const value = item[key];
    form[key] = type === 'lines' ? (value || []).join('\n') : type === 'list' ? (value || []).join(', ')
      : type === 'date' ? (value ? String(value).slice(0, 10) : '') : type === 'checkbox' ? !!value : (value ?? '');
  });
  return form;
};

const toBody = (fields, form) => Object.fromEntries(fields.map(([key, , type]) => {
  const value = form[key];
  const formatted = type === 'lines' ? value.split('\n').map((line) => line.trim()).filter(Boolean)
    : type === 'list' ? value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean) : value;
  return [key, formatted];
}));

const isEnglishField = ([key]) => key.endsWith('En');

export default function Modal({ title, kind, fields, item, onSave, onClose }) {
  const [form, setForm] = useState(() => toForm(fields, item || { active: true, price: 0, discountPercent: 0 }));
  const [language, setLanguage] = useState('ru');
  const [error, setError] = useState('');
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const translationPairs = fields
    .filter(([key, , type]) => ['text', 'textarea', 'list', 'lines'].includes(type) && fields.some(([candidate]) => candidate === `${key}En`))
    .map(([key]) => [key, `${key}En`]);
  const visibleFields = fields.filter((field) => language === 'en' ? isEnglishField(field) : !isEnglishField(field));
  const canTranslate = translationPairs.some(([key]) => String(form[key] || '').trim());
  const hasEnglishTranslation = translationPairs.some(([, key]) => String(form[key] || '').trim());
  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const translate = async () => {
    if (!canTranslate) {
      setError('Сначала заполните хотя бы одно поле на русском.');
      return false;
    }
    setError('');
    setTranslating(true);
    try {
      const source = Object.fromEntries(translationPairs.map(([key]) => [key, form[key] || '']));
      const result = await api('/api/admin/translate/english', {
        method: 'POST', body: JSON.stringify({ kind, source }),
      });
      setForm((previous) => ({ ...previous, ...(result.translations || {}) }));
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setTranslating(false);
    }
  };

  const changeLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage);
    if (nextLanguage === 'en' && !hasEnglishTranslation) await translate();
  };

  const save = async () => {
    if (translating || saving) return;
    setError('');
    setSaving(true);
    try { await onSave(toBody(fields, form)); } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="box">
        <h2>{title}</h2>
        {translationPairs.length > 0 && <div className="form-language" aria-label="Язык полей">
          <button type="button" className={language === 'ru' ? 'active' : 'secondary'} onClick={() => changeLanguage('ru')}>Русский</button>
          <button type="button" className={language === 'en' ? 'active' : 'secondary'} onClick={() => changeLanguage('en')} disabled={translating}>English</button>
        </div>}
        {language === 'en' && translationPairs.length > 0 && <div className="translation-tools">
          <button type="button" className="secondary" disabled={!canTranslate || translating} onClick={translate}>
            {translating ? 'Переводим…' : 'Обновить перевод'}
          </button>
          <p>Перевод заполняется при первом переходе на English. Здесь его можно проверить и исправить.</p>
        </div>}
        {visibleFields.map(([key, label, type, options]) => type === 'checkbox' ? (
          <label key={key} className="chk"><input type="checkbox" checked={form[key]} onChange={(event) => set(key, event.target.checked)} /> {label}</label>
        ) : type === 'image' ? (
          <div key={key} className="pe-field">
            <div className="pe-label">{label}</div>
            <PhotoEditor
              value={form[key]}
              onChange={(v) => set(key, v)}
              aspect={kind === 'courses' ? 4 / 3 : 1}
              startY={kind === 'courses' ? 0.5 : 0.25}
            />
          </div>
        ) : (
          <label key={key}>{label}
            {type === 'textarea' || type === 'lines' ? <textarea rows={type === 'lines' ? 5 : 3} value={form[key]} onChange={(event) => set(key, event.target.value)} />
              : type === 'select' ? <select value={form[key]} onChange={(event) => set(key, event.target.value)}>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
              : <input type={type === 'list' ? 'text' : type} value={form[key]} onChange={(event) => set(key, event.target.value)} />}
          </label>
        ))}
        <div className="err">{error}</div>
        <div className="row">
          <button disabled={translating || saving} onClick={save}>{saving ? 'Сохраняю…' : 'Сохранить'}</button>
          <button className="secondary" onClick={onClose} disabled={saving}>Отмена</button>
        </div>
      </div>
    </div>
  );
}