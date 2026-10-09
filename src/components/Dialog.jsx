export default function Dialog({ title, text, confirmText = 'Удалить', danger = true, busy, error, onConfirm, onClose }) {
  return (
    <div className="modal" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="box dialog" role="alertdialog">
        {title && <h2>{title}</h2>}
        <p className="dialog-text">{text}</p>
        {error && <p className="err">{error}</p>}
        <div className="row">
          <button className="secondary" onClick={onClose} disabled={busy}>{onConfirm ? 'Отмена' : 'Понятно'}</button>
          {onConfirm && (
            <button className={danger ? 'danger-solid' : ''} onClick={onConfirm} disabled={busy}>
              {busy ? 'Подождите...' : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}