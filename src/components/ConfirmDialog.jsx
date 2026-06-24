import Modal from './Modal'
import { Icon } from './Icon'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm', message, confirmText = 'Confirm', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={() => { onConfirm(); onClose() }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
