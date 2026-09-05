import { ref } from 'vue'
import { vi } from 'vitest'

vi.stubGlobal('useToast', () => ({
  toasts: { value: [] },
  success: vi.fn(),
  show: vi.fn(),
  dismiss: vi.fn(),
}))

vi.stubGlobal('useState', <T>(_key: string, init?: () => T) => {
  return ref(init ? init() : (undefined as T))
})

vi.stubGlobal('useApiBase', () => 'http://localhost:3001/api')
