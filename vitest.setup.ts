import { vi } from 'vitest'

vi.stubGlobal('useToast', () => ({
  toasts: { value: [] },
  success: vi.fn(),
  dismiss: vi.fn(),
}))

vi.stubGlobal('useApiBase', () => 'http://localhost:3001/api')
