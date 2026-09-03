import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Coffee } from '~/types/crm'
import { useAuthStore } from '~/stores/auth'
import { useProductsStore } from '~/stores/products'

const { apiGetCoffees, apiPostCoffee, apiPatchCoffee, apiDeleteCoffee } = vi.hoisted(() => ({
  apiGetCoffees: vi.fn(),
  apiPostCoffee: vi.fn(),
  apiPatchCoffee: vi.fn(),
  apiDeleteCoffee: vi.fn(),
}))

vi.mock('~/api/coffees', () => ({
  apiGetCoffees,
  apiGetCoffee: vi.fn(),
  apiPostCoffee,
  apiPatchCoffee,
  apiDeleteCoffee,
  apiDeleteCoffeeImage: vi.fn(),
}))

vi.mock('~/api/uploads', () => ({
  apiPostUpload: vi.fn(),
}))

vi.mock('~/api/auth', () => ({
  apiPostAuthLogin: vi.fn(),
  apiGetAuthMe: vi.fn(),
}))

const sampleCoffee: Coffee = {
  _id: 'coffee-1',
  name: 'Ethiopia Yirgacheffe',
  slug: 'ethiopia-yirgacheffe',
  country: 'Ethiopia',
  region: 'Yirgacheffe',
  variety: 'Heirloom',
  process: 'Washed',
  altitude: '1900m',
  description: 'Bright and floral',
  story: 'Farm story',
  flavorNotes: ['citrus', 'jasmine'],
  price: 1200,
  weights: [250, 500],
  image: '/images/ethiopia.jpg',
  gallery: ['/images/ethiopia.jpg'],
  stock: 10,
}

describe('products store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiGetCoffees.mockReset()
    apiPostCoffee.mockReset()
    apiPatchCoffee.mockReset()
    apiDeleteCoffee.mockReset()
  })

  it('coffeeToFields copies coffee text fields', () => {
    const store = useProductsStore()

    expect(store.coffeeToFields(sampleCoffee)).toEqual({
      name: sampleCoffee.name,
      country: sampleCoffee.country,
      region: sampleCoffee.region,
      variety: sampleCoffee.variety,
      process: sampleCoffee.process,
      altitude: sampleCoffee.altitude,
      description: sampleCoffee.description,
      story: sampleCoffee.story,
      flavorNotes: ['citrus', 'jasmine'],
    })
  })

  it('translationToFields returns fallback when translation is missing', () => {
    const store = useProductsStore()

    expect(store.translationToFields(undefined, sampleCoffee)).toEqual({
      name: sampleCoffee.name,
      country: '',
      region: '',
      variety: sampleCoffee.variety,
      process: '',
      altitude: '',
      description: '',
      story: '',
      flavorNotes: [''],
    })
  })

  it('translationToFields merges translation with fallbacks', () => {
    const store = useProductsStore()

    expect(
      store.translationToFields(
        {
          name: 'Ethiopia EN',
          country: 'Ethiopia',
          region: 'Yirgacheffe',
          process: 'Washed',
          description: 'English description',
          story: 'English story',
          flavorNotes: ['berry'],
        },
        sampleCoffee,
      ),
    ).toEqual({
      name: 'Ethiopia EN',
      country: 'Ethiopia',
      region: 'Yirgacheffe',
      variety: sampleCoffee.variety,
      process: 'Washed',
      altitude: '',
      description: 'English description',
      story: 'English story',
      flavorNotes: ['berry'],
    })
  })

  it('loadMoreProducts skips when there is nothing to load', async () => {
    const store = useProductsStore()
    store.hasMore = false

    await store.loadMoreProducts()

    expect(apiGetCoffees).not.toHaveBeenCalled()
  })

  it('saveProduct rejects empty flavor notes', async () => {
    const store = useProductsStore()
    const auth = useAuthStore()
    auth.token = 'jwt-token'

    await expect(
      store.saveProduct('ethiopia-yirgacheffe', 'ru', {
        ...store.coffeeToFields(sampleCoffee),
        flavorNotes: [' ', ''],
      }),
    ).rejects.toThrow('Добавьте хотя бы одну ноту вкуса')

    expect(apiPatchCoffee).not.toHaveBeenCalled()
  })

  it('createProduct normalizes slug and default image', async () => {
    const store = useProductsStore()
    const auth = useAuthStore()
    auth.token = 'jwt-token'

    apiPostCoffee.mockResolvedValue({
      success: true,
      data: sampleCoffee,
    })

    await store.createProduct({
      slug: ' NEW-Slug ',
      name: sampleCoffee.name,
      country: sampleCoffee.country,
      region: sampleCoffee.region,
      variety: sampleCoffee.variety,
      process: sampleCoffee.process,
      altitude: sampleCoffee.altitude,
      description: sampleCoffee.description,
      story: sampleCoffee.story,
      flavorNotes: ['citrus'],
      price: 1200,
      stock: 10,
      weights: [250],
      image: '',
    })

    expect(apiPostCoffee).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'new-slug',
        image: '/images/new-slug.jpg',
        gallery: ['/images/new-slug.jpg'],
        flavorNotes: ['citrus'],
      }),
      expect.objectContaining({
        headers: { Authorization: 'Bearer jwt-token' },
      }),
    )
  })

  it('deleteProduct removes item from list and clears current', async () => {
    const store = useProductsStore()
    const auth = useAuthStore()
    auth.token = 'jwt-token'
    store.items = [sampleCoffee]
    store.current = sampleCoffee
    store.total = 1

    apiDeleteCoffee.mockResolvedValue({ success: true })

    await store.deleteProduct(sampleCoffee.slug)

    expect(store.items).toEqual([])
    expect(store.current).toBeNull()
    expect(store.total).toBe(0)
  })
})
