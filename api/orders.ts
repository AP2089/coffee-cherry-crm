import type { ApiResponse, FetchOptions, PaginatedList } from '~/types/api'
import type { Order, OrderStatus } from '~/types/crm'

export const apiGetOrders = (
  query: { limit: number; offset: number; status?: OrderStatus },
  options: FetchOptions = {},
) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<PaginatedList<Order>>>('/orders', {
    query,
    ...options,
  })
}

export const apiGetOrder = (id: string, options: FetchOptions = {}) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<Order>>(`/orders/${id}`, {
    ...options,
  })
}

export const apiPatchOrder = (
  id: string,
  body: { status: OrderStatus },
  options: FetchOptions = {},
) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<Order>>(`/orders/${id}`, {
    method: 'PATCH',
    body,
    ...options,
  })
}
