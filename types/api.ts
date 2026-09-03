import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export type FetchOptions = NitroFetchOptions<NitroFetchRequest>

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface PaginatedList<T> {
  items: T[]
  total: number
  hasMore: boolean
}
