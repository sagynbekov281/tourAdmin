import { useEffect, useRef, useState } from 'react';

const MAX_BYTES = 350 * 1024;      // лимит сервера
const MAX_SOURCE = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const clamp = (v) => Math.min(1, Math.max(0, v));

const loadImage = (src) => new Promise((resolve, reject) => {
  const i = new Image();
  i.onload = () => resolve(i);
  i.onerror = () => reject(new Error('Не удалось открыть фотографию'));
  i.src = src;
});

const readFile = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(new Error('Не удалось прочитать файл'));
  r.readAsDataURL(file);
});

// Размер картинки в долях рамки (cover + масштаб)
const geom = (img, aspect, z) => {
  const R = img.naturalWidth / img.naturalHeight;
  return { w: z * Math.max(1, R / aspect), h: z * Math.max(1, aspect / R) };
};

async function renderCrop(img, aspect, pos) {
  const g = geom(img, aspect, pos.z);
  const sw = img.naturalWidth / g.w;
  const sh = img.naturalHeight / g.h;
  const sx = (img.naturalWidth - sw) * pos.x;
  const sy = (img.naturalHeight - sh) * pos.y;

  let W = Math.max(1, Math.min(1200, Math.round(sw)));
  let H = Math.max(1, Math.round(W / aspect));
  let quality = 0.88;

  for (;;) {
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Не удалось обработать фотографию');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
    if (!blob) throw new Error('Не удалось обработать фотографию');
    if (blob.size <= MAX_BYTES) return await readFile(blob);

    if (W < 300) throw new Error('Не удалось уменьшить фотографию до допустимого размера');
    if (quality > 0.55) quality -= 0.1;
    else { W = Math.round(W * 0.85); H = Math.max(1, Math.round(W / aspect)); quality = 0.8; }
  }
}

export default function PhotoEditor({ value, onChange, aspect = 4 / 3, startY = 0.5 }) {
  const [img, setImg] = useState(null);
  const [pos, setPos] = useState({ x: 0.5, y: startY, z: 1 });
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const frame = useRef(null);
  const fileRef = useRef(null);
  const drag = useRef(null);
  const timer = useRef(null);
  const seq = useRef(0);
  const emitted = useRef(null);
  const posRef = useRef(pos);

  const updatePos = (p) => { posRef.current = p; setPos(p); };

  // Подгружаем уже сохранённое фото при открытии формы
  useEffect(() => {
    if (!value) { setImg(null); return; }
    if (value === emitted.current) return;
    let off = false;
    loadImage(value)
      .then((i) => { if (!off) { setImg(i); updatePos({ x: 0.5, y: startY, z: 1 }); } })
      .catch(() => {});
    return () => { off = true; };
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const emit = (image, p, delay = 250) => {
    clearTimeout(timer.current);
    const id = ++seq.current;
    timer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const url = await renderCrop(image, aspect, p);
        if (id !== seq.current) return;
        emitted.current = url;
        onChange(url);
        setError('');
      } catch (e) {
        if (id === seq.current) setError(e.message);
      } finally {
        if (id === seq.current) setBusy(false);
      }
    }, delay);
  };

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError('Выберите фото в формате JPG, PNG или WebP');
    if (file.size > MAX_SOURCE) return setError('Фото больше 5 МБ');
    try {
      const i = await loadImage(await readFile(file));
      const p = { x: 0.5, y: startY, z: 1 };
      setImg(i); updatePos(p); setError('');
      emit(i, p, 0);
    } catch (err) { setError(err.message); }
  };

  const remove = () => {
    seq.current++;
    clearTimeout(timer.current);
    emitted.current = '';
    setImg(null); setError(''); setBusy(false);
    onChange('');
  };

  const down = (e) => {
    if (!img) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, x: posRef.current.x, y: posRef.current.y };
    setDragging(true);
  };
  const move = (e) => {
    if (!drag.current || !img) return;
    const r = frame.current.getBoundingClientRect();
    const g = geom(img, aspect, posRef.current.z);
    const d = drag.current;
    const x = g.w > 1.001 ? clamp(d.x - (e.clientX - d.sx) / ((g.w - 1) * r.width)) : posRef.current.x;
    const y = g.h > 1.001 ? clamp(d.y - (e.clientY - d.sy) / ((g.h - 1) * r.height)) : posRef.current.y;
    updatePos({ ...posRef.current, x, y });
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    emit(img, posRef.current);
  };
  const zoom = (e) => {
    const p = { ...posRef.current, z: Number(e.target.value) };
    updatePos(p);
    if (img) emit(img, p);
  };

  const g = img ? geom(img, aspect, pos.z) : null;

  return (
    <div className="pe">
      <div
        ref={frame}
        className={'pe-frame' + (dragging ? ' drag' : '')}
        style={{ aspectRatio: String(aspect) }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      >
        {img ? (
          <img
            src={img.src} alt="" draggable={false}
            style={{
              width: `${g.w * 100}%`, height: `${g.h * 100}%`,
              left: `${-(g.w - 1) * pos.x * 100}%`, top: `${-(g.h - 1) * pos.y * 100}%`,
            }}
          />
        ) : (
          <div className="pe-empty">Фото не выбрано</div>
        )}
      </div>

      {img && (
        <>
          <div className="pe-zoom">
            <span>−</span>
            <input type="range" min="1" max="4" step="0.01" value={pos.z} onChange={zoom} />
            <span>＋</span>
          </div>
          <p className="pe-hint">Двигайте фото пальцем или мышкой, ползунком меняйте масштаб. Что внутри рамки, то и будет на сайте.{busy ? ' Сохраняю…' : ''}</p>
        </>
      )}
      {error && <p className="err">{error}</p>}

      <div className="pe-actions">
        <button type="button" className="secondary" onClick={() => fileRef.current?.click()}>
          {img ? '🔄 Заменить фото' : '📷 Выбрать фото'}
        </button>
        {img && <button type="button" className="danger" onClick={remove}>🗑 Убрать</button>}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} />
    </div>
  );
}