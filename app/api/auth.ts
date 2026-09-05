import type { ApiResponse, FetchOptions } from '~/types/api'
import type { AuthUser } from '~/types/auth'

export const apiPostAuthLogin = (
  body: { username: string; password: string },
  options: FetchOptions = {},
) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<{ token: string; user: AuthUser }>>('/auth/login', {
    method: 'POST',
    body,
    ...options,
  })
}

export const apiGetAuthMe = (options: FetchOptions = {}) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<AuthUser>>('/auth/me', {
    ...options,
  })
}
