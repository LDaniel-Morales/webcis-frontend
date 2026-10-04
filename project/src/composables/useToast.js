import { reactive } from 'vue'

const DEFAULT_DURATION = 3600

// Estado a nivel de módulo (singleton): un único ToastHost montado en la
// vista alcanza para que cualquier componente hijo dispare notify().
const toasts = reactive([])

function dismiss(id) {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) toasts.splice(index, 1)
}

function notify(message, { kind = 'success', duration = DEFAULT_DURATION } = {}) {
  const id = crypto.randomUUID()
  toasts.push({ id, message, kind })
  setTimeout(() => dismiss(id), duration)
}

export function useToast() {
  return { toasts, notify, dismiss }
}
