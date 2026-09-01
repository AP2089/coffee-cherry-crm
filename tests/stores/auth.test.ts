import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { UserRole } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'

const { saveAuthToken, clearAuthToken } = vi.hoisted(() => ({
  saveAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
}))

vi.mock('~/composables/useApiBase', () => ({
  useApiBase: () => 'http://localhost:3001/api',
  getAuthToken: vi.fn(() => null),
  saveAuthToken,
  clearAuthToken,
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('$fetch', vi.fn())
    saveAuthToken.mockClear()
    clearAuthToken.mockClear()
  })

  it('isAuthenticated is false without token or user', () => {
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is true with token and user', () => {
    const store = useAuthStore()
    store.token = 'token'
    store.user = { username: 'admin', role: UserRole.Admin }

    expect(store.isAuthenticated).toBe(true)
  })

  it('logout clears state and token', () => {
    const store = useAuthStore()
    store.token = 'token'
    store.user = { username: 'admin', role: UserRole.Admin }

    store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(clearAuthToken).toHaveBeenCalledOnce()
  })

  it('login saves token and user on success', async () => {
    const store = useAuthStore()
    const user = { username: 'admin', role: UserRole.Admin }

    vi.mocked($fetch).mockResolvedValue({
      success: true,
      data: { token: 'jwt-token', user },
    })

    await store.login('admin', 'secret')

    expect(store.token).toBe('jwt-token')
    expect(store.user).toEqual(user)
    expect(saveAuthToken).toHaveBeenCalledWith('jwt-token')
    expect(store.error).toBeNull()
  })

  it('login sets localized error on 401', async () => {
    const store = useAuthStore()

    vi.mocked($fetch).mockRejectedValue({
      statusCode: 401,
      message: 'Unauthorized',
    })

    await expect(store.login('admin', 'wrong')).rejects.toMatchObject({ statusCode: 401 })

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.error).toBe('Неверный логин или пароль')
    expect(clearAuthToken).toHaveBeenCalledOnce()
  })

  it('fetchMe loads user and logs out on failure', async () => {
    const store = useAuthStore()
    store.token = 'jwt-token'

    vi.mocked($fetch).mockResolvedValueOnce({
      success: true,
      data: { username: 'admin', role: UserRole.Admin },
    })

    await store.fetchMe()

    expect(store.user?.username).toBe('admin')

    vi.mocked($fetch).mockRejectedValueOnce(new Error('Unauthorized'))

    await store.fetchMe()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(clearAuthToken).toHaveBeenCalled()
  })
})
