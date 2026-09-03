import type { ApiResponse, FetchOptions } from '~/types/api'

export const apiPostUpload = (body: FormData, options: FetchOptions = {}) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<{ url: string }>>('/uploads', {
    method: 'POST',
    body,
    ...options,
  })
}
