import type { ApiResponse, FetchOptions, PaginatedList } from '~/types/api'
import type { ContactMessage, ContactMessageStatus } from '~/types/crm'

export const apiGetContacts = (
  query: { limit: number; offset: number; status?: ContactMessageStatus },
  options: FetchOptions = {},
) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<PaginatedList<ContactMessage>>>('/contacts', {
    query,
    ...options,
  })
}

export const apiPatchContact = (
  id: string,
  body: { status: ContactMessageStatus },
  options: FetchOptions = {},
) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<ContactMessage>>(`/contacts/${id}`, {
    method: 'PATCH',
    body,
    ...options,
  })
}

export const apiDeleteContact = (id: string, options: FetchOptions = {}) => {
  const { $apiContent } = useNuxtApp()

  return $apiContent<ApiResponse<unknown>>(`/contacts/${id}`, {
    method: 'DELETE',
    ...options,
  })
}
