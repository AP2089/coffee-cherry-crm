import { defineStore } from 'pinia'
import type {
  Coffee,
  CoffeeLocalizedContent,
  CoffeeTextFields,
  CreateCoffeeInput,
} from '~/types/crm'
import {
  apiDeleteCoffee,
  apiDeleteCoffeeImage,
  apiGetCoffee,
  apiGetCoffees,
  apiPatchCoffee,
  apiPostCoffee,
} from '~/api/coffees'
import { apiPostUpload } from '~/api/uploads'
import { useAuthStore } from '~/stores/auth'
import { CRM_PAGE_SIZE } from '~/utils/pagination'

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [] as Coffee[],
    current: null as Coffee | null,
    total: 0,
    hasMore: false,
    loading: false,
    loadingMore: false,
    initialized: false,
    saving: false,
    uploadingImage: false,
    imageSaving: false,
    deleting: null as string | null,
    error: null as string | null,
  }),

  actions: {
    authHeaders() {
      const auth = useAuthStore()
      return { Authorization: `Bearer ${auth.token}` }
    },

    async fetchProducts(options?: { append?: boolean }) {
      const append = options?.append ?? false

      if (append) {
        this.loadingMore = true
      } else {
        this.loading = true
      }

      this.error = null

      try {
        const response = await apiGetCoffees(
          {
            limit: CRM_PAGE_SIZE,
            offset: append ? this.items.length : 0,
          },
          { headers: this.authHeaders() },
        )

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось загрузить товары')
        }

        this.items = append ? [...this.items, ...response.data.items] : response.data.items
        this.total = response.data.total
        this.hasMore = response.data.hasMore
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить товары'
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

    async loadMoreProducts() {
      if (!this.hasMore || this.loading || this.loadingMore) return
      await this.fetchProducts({ append: true })
    },

    async fetchProduct(slug: string) {
      this.loading = true
      this.error = null

      try {
        const response = await apiGetCoffee(slug, {
          headers: this.authHeaders(),
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Товар не найден')
        }

        this.current = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Товар не найден'
        this.current = null
      } finally {
        this.loading = false
      }
    },

    coffeeToFields(coffee: Coffee): CoffeeTextFields {
      return {
        name: coffee.name,
        country: coffee.country,
        region: coffee.region,
        variety: coffee.variety,
        process: coffee.process,
        altitude: coffee.altitude,
        description: coffee.description,
        story: coffee.story,
        flavorNotes: [...coffee.flavorNotes],
      }
    },

    translationToFields(
      translation: CoffeeLocalizedContent | undefined,
      fallback: Coffee,
    ): CoffeeTextFields {
      if (!translation) {
        return {
          name: fallback.name,
          country: '',
          region: '',
          variety: fallback.variety,
          process: '',
          altitude: '',
          description: '',
          story: '',
          flavorNotes: [''],
        }
      }

      return {
        name: translation.name || fallback.name,
        country: translation.country,
        region: translation.region,
        variety: translation.variety || fallback.variety,
        process: translation.process,
        altitude: translation.altitude || '',
        description: translation.description,
        story: translation.story,
        flavorNotes: translation.flavorNotes.length ? [...translation.flavorNotes] : [''],
      }
    },

    async uploadImage(
      file: File,
      options: { slug: string; kind: 'main' | 'gallery' },
    ): Promise<string> {
      this.uploadingImage = true
      this.error = null

      try {
        const formData = new FormData()
        formData.append('slug', options.slug)
        formData.append('kind', options.kind)
        formData.append('file', file)

        const response = await apiPostUpload(formData, {
          headers: this.authHeaders(),
        })

        if (!response.success || !response.data?.url) {
          throw new Error(response.message || 'Не удалось загрузить изображение')
        }

        return response.data.url
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить изображение'
        throw error
      } finally {
        this.uploadingImage = false
      }
    },

    async saveProductImage(slug: string, imagePath: string, options?: { silent?: boolean }) {
      this.imageSaving = true
      this.error = null

      const image = imagePath.trim()

      if (!image) {
        this.imageSaving = false
        throw new Error('Загрузите изображение')
      }

      try {
        const response = await apiPatchCoffee(
          slug,
          {
            image,
            gallery: [image],
          },
          { headers: this.authHeaders() },
        )

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось сохранить изображение')
        }

        this.current = response.data
        const index = this.items.findIndex((item) => item.slug === slug)
        if (index !== -1) {
          this.items[index] = response.data
        }

        if (!options?.silent) {
          useToast().success('Изображение сохранено')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось сохранить изображение'
        throw error
      } finally {
        this.imageSaving = false
      }
    },

    async removeProductImage(slug: string, options?: { silent?: boolean }) {
      this.imageSaving = true
      this.error = null

      try {
        const response = await apiDeleteCoffeeImage(slug, {
          headers: this.authHeaders(),
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось удалить изображение')
        }

        this.current = response.data
        const index = this.items.findIndex((item) => item.slug === slug)
        if (index !== -1) {
          this.items[index] = response.data
        }

        if (!options?.silent) {
          useToast().success('Изображение удалено')
        }

        return response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось удалить изображение'
        throw error
      } finally {
        this.imageSaving = false
      }
    },

    async saveProduct(slug: string, locale: 'ru' | 'en', fields: CoffeeTextFields) {
      this.saving = true
      this.error = null

      try {
        const flavorNotes = fields.flavorNotes.map((note) => note.trim()).filter(Boolean)

        if (!flavorNotes.length) {
          throw new Error('Добавьте хотя бы одну ноту вкуса')
        }

        const textPayload = {
          name: fields.name,
          country: fields.country,
          region: fields.region,
          variety: fields.variety,
          process: fields.process,
          altitude: fields.altitude,
          description: fields.description,
          story: fields.story,
          flavorNotes,
        }

        const body =
          locale === 'ru'
            ? textPayload
            : {
                translations: {
                  en: textPayload,
                },
              }

        const response = await apiPatchCoffee(slug, body, {
          headers: this.authHeaders(),
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось сохранить товар')
        }

        this.current = response.data
        const index = this.items.findIndex((item) => item.slug === slug)
        if (index !== -1) {
          this.items[index] = response.data
        }

        useToast().success('Товар сохранён')
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось сохранить'
        throw error
      } finally {
        this.saving = false
      }
    },

    async createProduct(input: CreateCoffeeInput) {
      this.saving = true
      this.error = null

      try {
        const flavorNotes = input.flavorNotes.map((note) => note.trim()).filter(Boolean)

        if (!flavorNotes.length) {
          throw new Error('Добавьте хотя бы одну ноту вкуса')
        }

        const slug = input.slug.trim().toLowerCase()
        const image = input.image.trim() || `/images/${slug}.jpg`
        const gallery = input.gallery?.length ? input.gallery : [image]

        const response = await apiPostCoffee(
          {
            ...input,
            slug,
            flavorNotes,
            image,
            gallery,
          },
          { headers: this.authHeaders() },
        )

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Не удалось создать товар')
        }

        this.items = [...this.items, response.data]
        this.total += 1
        useToast().success('Товар создан')
        return response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось создать товар'
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteProduct(slug: string) {
      this.deleting = slug
      this.error = null

      try {
        const response = await apiDeleteCoffee(slug, {
          headers: this.authHeaders(),
        })

        if (!response.success) {
          throw new Error(response.message || 'Не удалось удалить товар')
        }

        this.items = this.items.filter((item) => item.slug !== slug)
        this.total = Math.max(0, this.total - 1)

        if (this.current?.slug === slug) {
          this.current = null
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Не удалось удалить товар'
        throw error
      } finally {
        this.deleting = null
      }
    },
  },
})
