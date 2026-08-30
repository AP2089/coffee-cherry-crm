import { defineStore } from 'pinia'
import type { ApiResponse, PaginatedList } from '~/types/api'
import type { Order, OrderStatus } from '~/types/crm'
import { useApiBase } from '~/composables/useApiBase'
import { useAuthStore } from '~/stores/auth'
import { CRM_PAGE_SIZE } from '~/utils/pagination'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    items: [] as Order[],
    current: null as Order | null,
    total: 0,
    hasMore: false,
    statusFilter: 'all' as OrderStatus | 'all',
    loading: false,
    loadingMore: false,
    initialized: false,
    detailLoading: false,
    saving: false,
    error: null as string | null,
  }),

  actions: {
    authHeaders() {
      const auth = useAuthStore()
      return { Authorization: `Bearer ${auth.token}` }
    },

    async fetchOrders(options?: { append?: boolean }) {
      const append = options?.append ?? false

      if (append) {
        this.loadingMore = true
      } else {
        this.loading = true
      }

      this.error = null

      try {
        const params = new URLSearchParams({
          limit: String(CRM_PAGE_SIZE),
          offset: append ? String(this.items.length) : '0',
        })

        if (this.statusFilter !== 'all') {
          params.set('status', this.statusFilter)
        }

        const response = await $fetch<ApiResponse<PaginatedList<Order>>>(
          `${useApiBase()}/orders?${params.toString()}`,
          { headers: this.authHeaders() },
        )

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось загрузить заказы')
        }

        this.items = append ? [...this.items, ...response.data.items] : response.data.items
        this.total = response.data.total
        this.hasMore = response.data.hasMore
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить заказы'
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

    async loadMoreOrders() {
      if (!this.hasMore || this.loading || this.loadingMore) return
      await this.fetchOrders({ append: true })
    },

    async fetchOrder(id: string) {
      this.detailLoading = true
      this.error = null

      try {
        const response = await $fetch<ApiResponse<Order>>(`${useApiBase()}/orders/${id}`, {
          headers: this.authHeaders(),
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Заказ не найден')
        }

        this.current = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Заказ не найден'
        this.current = null
      } finally {
        this.detailLoading = false
      }
    },

    async updateStatus(id: string, status: OrderStatus) {
      this.saving = true

      try {
        const response = await $fetch<ApiResponse<Order>>(`${useApiBase()}/orders/${id}`, {
          method: 'PATCH',
          headers: this.authHeaders(),
          body: { status },
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось обновить статус')
        }

        this.current = response.data

        const index = this.items.findIndex((item) => item._id === id)
        if (index !== -1) {
          this.items[index] = response.data
        }

        if (this.statusFilter !== 'all' && response.data.status !== this.statusFilter) {
          this.items = this.items.filter((item) => item._id !== id)
          this.total = Math.max(0, this.total - 1)
        }

        useToast().success('Статус заказа обновлён')
      } finally {
        this.saving = false
      }
    },

    setStatusFilter(status: OrderStatus | 'all') {
      this.statusFilter = status
    },
  },
})
