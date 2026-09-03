import { defineStore } from 'pinia'
import type { ContactMessage, ContactMessageStatus } from '~/types/crm'
import { apiDeleteContact, apiGetContacts, apiPatchContact } from '~/api/contacts'
import { useAuthStore } from '~/stores/auth'
import { CRM_PAGE_SIZE } from '~/utils/pagination'

export const useContactsStore = defineStore('contacts', {
  state: () => ({
    items: [] as ContactMessage[],
    total: 0,
    hasMore: false,
    statusFilter: 'all' as ContactMessageStatus | 'all',
    loading: false,
    loadingMore: false,
    initialized: false,
    error: null as string | null,
    actionLoading: null as string | null,
  }),

  actions: {
    authHeaders() {
      const auth = useAuthStore()
      return { Authorization: `Bearer ${auth.token}` }
    },

    async fetchContacts(options?: { append?: boolean }) {
      const append = options?.append ?? false

      if (append) {
        this.loadingMore = true
      } else {
        this.loading = true
      }

      this.error = null

      try {
        const response = await apiGetContacts(
          {
            limit: CRM_PAGE_SIZE,
            offset: append ? this.items.length : 0,
            ...(this.statusFilter !== 'all' ? { status: this.statusFilter } : {}),
          },
          { headers: this.authHeaders() },
        )

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось загрузить обращения')
        }

        this.items = append ? [...this.items, ...response.data.items] : response.data.items
        this.total = response.data.total
        this.hasMore = response.data.hasMore
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить обращения'
        if (!append) {
          this.items = []
        }
      } finally {
        if (append) {
          this.loadingMore = false
        } else {
          this.loading = false
          this.initialized = true
        }
      }
    },

    async loadMoreContacts() {
      if (!this.hasMore || this.loading || this.loadingMore) return
      await this.fetchContacts({ append: true })
    },

    async updateStatus(id: string, status: ContactMessageStatus) {
      this.actionLoading = id

      try {
        const response = await apiPatchContact(id, { status }, { headers: this.authHeaders() })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось обновить статус')
        }

        const index = this.items.findIndex((item) => item._id === id)
        if (index !== -1) {
          this.items[index] = response.data
        }

        if (this.statusFilter !== 'all' && response.data.status !== this.statusFilter) {
          this.items = this.items.filter((item) => item._id !== id)
          this.total = Math.max(0, this.total - 1)
        }

        useToast().success('Статус обновлён')
      } finally {
        this.actionLoading = null
      }
    },

    async deleteContact(id: string) {
      this.actionLoading = id

      try {
        const response = await apiDeleteContact(id, {
          headers: this.authHeaders(),
        })

        if (!response.success) {
          throw new Error(response.message || 'Не удалось удалить обращение')
        }

        this.items = this.items.filter((item) => item._id !== id)
        this.total = Math.max(0, this.total - 1)
        useToast().success('Обращение удалено')
      } finally {
        this.actionLoading = null
      }
    },

    setStatusFilter(status: ContactMessageStatus | 'all') {
      this.statusFilter = status
    },
  },
})
