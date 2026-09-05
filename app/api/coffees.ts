import type { ApiResponse, FetchOptions, PaginatedList } from '~/types/api'
import type { Coffee, CreateCoffeeInput } from '~/types/crm'

export const apiGetCoffees = (
  query: { limit: number; offset: number },
  options: FetchOptions = {},
) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<PaginatedList<Coffee>>>('/coffees', {
    query,
    ...options,
  })
}

export const apiGetCoffee = (slug: string, options: FetchOptions = {}) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<Coffee>>(`/coffees/${slug}`, {
    ...options,
  })
}

export const apiPostCoffee = (
  body: CreateCoffeeInput & { gallery: string[] },
  options: FetchOptions = {},
) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<Coffee>>('/coffees', {
    method: 'POST',
    body,
    ...options,
  })
}

export const apiPatchCoffee = (slug: string, body: object, options: FetchOptions = {}) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<Coffee>>(`/coffees/${slug}`, {
    method: 'PATCH',
    body,
    ...options,
  })
}

export const apiDeleteCoffee = (slug: string, options: FetchOptions = {}) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<unknown>>(`/coffees/${slug}`, {
    method: 'DELETE',
    ...options,
  })
}

export const apiDeleteCoffeeImage = (slug: string, options: FetchOptions = {}) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<Coffee>>(`/coffees/${slug}/image`, {
    method: 'DELETE',
    ...options,
  })
}
