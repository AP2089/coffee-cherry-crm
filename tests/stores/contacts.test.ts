import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ContactMessage } from '~/types/crm'
import { useAuthStore } from '~/stores/auth'
import { useContactsStore } from '~/stores/contacts'

const { apiGetContacts, apiPatchContact } = vi.hoisted(() => ({
  apiGetContacts: vi.fn(),
  apiPatchContact: vi.fn(),
}))

vi.mock('~/api/contacts', () => ({
  apiGetContacts,
  apiPatchContact,
  apiDeleteContact: vi.fn(),
}))

vi.mock('~/api/auth', () => ({
  apiPostAuthLogin: vi.fn(),
  apiGetAuthMe: vi.fn(),
}))

const sampleContact: ContactMessage = {
  _id: 'contact-1',
  name: 'Anna',
  email: 'anna@test.com',
  message: 'Hello',
  status: 'new',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('contacts store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiGetContacts.mockReset()
    apiPatchContact.mockReset()
  })

  it('setStatusFilter updates filter value', () => {
    const store = useContactsStore()

    store.setStatusFilter('archived')

    expect(store.statusFilter).toBe('archived')
  })

  it('loadMoreContacts skips when already loading', async () => {
    const store = useContactsStore()
    store.hasMore = true
    store.loading = true

    await store.loadMoreContacts()

    expect(apiGetContacts).not.toHaveBeenCalled()
  })

  it('updateStatus removes item when it no longer matches filter', async () => {
    const store = useContactsStore()
    const auth = useAuthStore()
    auth.token = 'jwt-token'
    store.items = [sampleContact]
    store.total = 1
    store.statusFilter = 'new'

    apiPatchContact.mockResolvedValue({
      success: true,
      data: { ...sampleContact, status: 'archived' },
    })

    await store.updateStatus(sampleContact._id, 'archived')

    expect(store.items).toEqual([])
    expect(store.total).toBe(0)
  })
})
