<template>
  <NuxtLayout name="app">
    <LayoutAppHeader title="Новый товар" subtitle="Создание позиции в каталоге" />

    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <Button variant="outline" size="sm" class="mb-6" @click="navigateTo('/products')">
        ← К списку
      </Button>

      <Card class="border-border">
        <CardContent class="space-y-5 p-4 md:p-6">
          <Alert v-if="products.error" variant="destructive">
            <AlertDescription>{{ products.error }}</AlertDescription>
          </Alert>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label>Slug</Label>
              <Input v-model="form.slug" placeholder="my-coffee" />
            </div>
            <div class="space-y-2">
              <Label>Название</Label>
              <Input v-model="form.name" />
            </div>
            <div class="space-y-2">
              <Label>Цена (₽ за 250 г)</Label>
              <Input v-model.number="form.price" type="number" min="0" />
            </div>
            <div class="space-y-2">
              <Label>Остаток</Label>
              <Input v-model.number="form.stock" type="number" min="0" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Фасовки (г)</Label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="weight in weightOptions"
                :key="weight"
                type="button"
                size="sm"
                :variant="form.weights.includes(weight) ? 'magnetic-filled' : 'outline'"
                @click="toggleWeight(weight)"
              >
                {{ weight }}
              </Button>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label>Страна</Label>
              <Input v-model="form.country" />
            </div>
            <div class="space-y-2">
              <Label>Регион</Label>
              <Input v-model="form.region" />
            </div>
            <div class="space-y-2">
              <Label>Сорт</Label>
              <Input v-model="form.variety" />
            </div>
            <div class="space-y-2">
              <Label>Обработка</Label>
              <Input v-model="form.process" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label>Высота</Label>
              <Input v-model="form.altitude" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Описание</Label>
            <Textarea v-model="form.description" rows="4" />
          </div>

          <div class="space-y-2">
            <Label>История</Label>
            <Textarea v-model="form.story" rows="5" />
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <Label>Ноты вкуса</Label>
              <Button type="button" size="sm" variant="outline" @click="addFlavorNote"
                >Добавить</Button
              >
            </div>

            <div v-for="(_, index) in form.flavorNotes" :key="index" class="flex gap-2">
              <Input v-model="form.flavorNotes[index]" class="flex-1" />
              <Button
                type="button"
                variant="outline"
                class="h-auto shrink-0 px-3 py-2.5 text-sm"
                :disabled="form.flavorNotes.length <= 1"
                @click="removeFlavorNote(index)"
              >
                ×
              </Button>
            </div>
          </div>

          <ProductImagesEditor
            ref="imagesEditorRef"
            v-model:image="form.image"
            :slug="form.slug.trim().toLowerCase()"
          />

          <div class="flex justify-end pt-2">
            <Button
              variant="magnetic-filled"
              :disabled="products.saving || products.uploadingImage || products.imageSaving"
              @click="createProduct"
            >
              {{ createLabel }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { CreateCoffeeInput } from '~/types/crm'

definePageMeta({
  layout: false,
  ssr: false,
})

const products = useProductsStore()
const weightOptions = [250, 500, 1000] as const
const imagesEditorRef = ref<{
  commit: (options?: { mode?: 'create' | 'edit' }) => Promise<string>
} | null>(null)

const form = ref<CreateCoffeeInput>({
  slug: '',
  name: '',
  price: 0,
  stock: 0,
  weights: [250, 500, 1000],
  image: '',
  country: '',
  region: '',
  variety: '',
  process: '',
  altitude: '',
  description: '',
  story: '',
  flavorNotes: [''],
})

function toggleWeight(weight: 250 | 500 | 1000) {
  if (form.value.weights.includes(weight)) {
    if (form.value.weights.length === 1) return
    form.value.weights = form.value.weights.filter((item) => item !== weight)
    return
  }

  form.value.weights = [...form.value.weights, weight].sort((a, b) => a - b)
}

function addFlavorNote() {
  form.value.flavorNotes.push('')
}

function removeFlavorNote(index: number) {
  form.value.flavorNotes.splice(index, 1)
}

async function createProduct() {
  const slug = form.value.slug.trim().toLowerCase()

  try {
    const uploadedImage = await imagesEditorRef.value?.commit({ mode: 'create' })
    const image = uploadedImage?.trim() || form.value.image.trim() || `/images/${slug}.jpg`

    const coffee = await products.createProduct({
      ...form.value,
      slug,
      image,
    })
    await navigateTo(`/products/${coffee.slug}`)
  } catch {
    // error in store
  }
}

const createLabel = computed(() => {
  if (products.saving || products.uploadingImage || products.imageSaving) {
    return 'Создание…'
  }

  return 'Создать товар'
})
</script>
