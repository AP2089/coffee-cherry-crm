export interface ToastItem {
  id: number
  message: string
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

const TOAST_DURATION = 3000

export function useToast() {
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }

  function show(message: string) {
    const id = ++nextId

    toasts.value.push({ id, message })

    setTimeout(() => {
      dismiss(id)
    }, TOAST_DURATION)
  }

  function success(message: string) {
    show(message)
  }

  return {
    toasts,
    success,
    dismiss,
  }
}
