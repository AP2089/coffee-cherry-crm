import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Order } from '~/types/crm'
import { useAuthStore } from '~/stores/auth'
import { useOrdersStore } from '~/stores/orders'

const { apiGetOrders, apiPatchOrder } = vi.hoisted(() => ({
  apiGetOrders: vi.fn(),
  apiPatchOrder: vi.fn(),
}))

vi.mock('~/api/orders', () => ({
  apiGetOrders,
  apiGetOrder: vi.fn(),
  apiPatchOrder,
}))

vi.mock('~/api/auth', () => ({
  apiPostAuthLogin: vi.fn(),
  apiGetAuthMe: vi.fn(),
}))

const sampleOrder: Order = {
  _id: 'order-1',
  items: [
    {
      coffeeId: 'coffee-1',
      slug: 'ethiopia',
      name: 'Ethiopia',
      weight: 250,
      quantity: 1,
      price: 1200,
    },
  ],
  customer: {
    name: 'Ivan',
    phone: '+79990000000',
    email: 'ivan@test.com',
    city: 'Moscow',
    address: 'Red Square 1',
  },
  totalPrice: 1200,
  status: 'pending',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('orders store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiGetOrders.mockReset()
    apiPatchOrder.mockReset()
  })

  it('setStatusFilter updates filter value', () => {
    const store = useOrdersStore()

    store.setStatusFilter('confirmed')

    expect(store.statusFilter).toBe('confirmed')
  })

  it('loadMoreOrders skips when hasMore is false', async () => {
    const store = useOrdersStore()
    store.hasMore = false

    await store.loadMoreOrders()

    expect(apiGetOrders).not.toHaveBeenCalled()
  })

  it('updateStatus updates current order and list item', async () => {
    const store = useOrdersStore()
    const auth = useAuthStore()
    auth.token = 'jwt-token'
    store.items = [sampleOrder]
    store.current = sampleOrder

    const updatedOrder = { ...sampleOrder, status: 'confirmed' as const }

    apiPatchOrder.mockResolvedValue({
      success: true,
      data: updatedOrder,
    })

    await store.updateStatus(sampleOrder._id, 'confirmed')

    expect(store.current).toEqual(updatedOrder)
    expect(store.items[0]?.status).toBe('confirmed')
  })

  it('updateStatus removes item when it no longer matches filter', async () => {
    const store = useOrdersStore()
    const auth = useAuthStore()
    auth.token = 'jwt-token'
    store.items = [sampleOrder]
    store.total = 1
    store.statusFilter = 'pending'

    apiPatchOrder.mockResolvedValue({
      success: true,
      data: { ...sampleOrder, status: 'confirmed' },
    })

    await store.updateStatus(sampleOrder._id, 'confirmed')

    expect(store.items).toEqual([])
    expect(store.total).toBe(0)
  })
})
