<template>
  <NuxtLayout name="app">
    <LayoutAppHeader :title="products.current?.name || 'Товар'" subtitle="Редактирование товара" />

    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      <div v-if="products.loading" class="space-y-4">
        <Skeleton class="h-10 w-48" />
        <Skeleton class="h-96 w-full" />
      </div>

      <Alert v-else-if="products.error && !products.current" variant="destructive">
        <AlertDescription>{{ products.error }}</AlertDescription>
      </Alert>

      <template v-else-if="products.current">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" @click="navigateTo('/products')">← К списку</Button>

            <div class="flex gap-2">
              <Button
                size="sm"
                :variant="activeLocale === 'ru' ? 'magnetic-filled' : 'outline'"
                @click="activeLocale = 'ru'"
              >
                RU
              </Button>
              <Button
                size="sm"
                :variant="activeLocale === 'en' ? 'magnetic-filled' : 'outline'"
                @click="activeLocale = 'en'"
              >
                EN
              </Button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button
                  size="sm"
                  variant="destructive"
                  class="h-[36px] min-h-[36px] box-border py-0"
                  :disabled="products.deleting === slug"
                >
                  Удалить
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {{ products.current.name }} будет удалён из каталога вместе с переводами.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction @click="removeProduct">Удалить</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="magnetic-filled"
              size="sm"
              class="h-[36px] min-h-[36px] box-border py-0"
              :disabled="products.saving || products.uploadingImage || products.imageSaving"
              @click="saveProduct"
            >
              {{ saveLabel }}
            </Button>
          </div>
        </div>

        <Card class="border-border">
          <CardContent class="space-y-5 p-4 md:p-6">
            <Alert v-if="products.error" variant="destructive">
              <AlertDescription>{{ products.error }}</AlertDescription>
            </Alert>

            <ProductImagesEditor
              ref="imagesEditorRef"
              v-model:image="image"
              :slug="slug"
              @saved="syncImage"
            />

            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Название</Label>
                <Input v-model="form.name" />
              </div>
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
              <div class="space-y-2">
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
                <Button type="button" size="sm" variant="outline" @click="addFlavorNote">
                  Добавить
                </Button>
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
          </CardContent>
        </Card>
      </template>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { CoffeeTextFields } from '~/types/crm'

definePageMeta({
  layout: false,
  ssr: false,
})

const route = useRoute()
const products = useProductsStore()
const slug = computed(() => String(route.params.slug))
const activeLocale = ref<'ru' | 'en'>('ru')
const image = ref('')
const imagesEditorRef = ref<{ commit: () => Promise<string> } | null>(null)
const form = ref<CoffeeTextFields>({
  name: '',
  country: '',
  region: '',
  variety: '',
  process: '',
  altitude: '',
  description: '',
  story: '',
  flavorNotes: [''],
})

function syncTextFields() {
  if (!products.current) return

  if (activeLocale.value === 'ru') {
    form.value = products.coffeeToFields(products.current)
    return
  }

  form.value = products.translationToFields(products.current.translations?.en, products.current)
}

function syncImage() {
  if (!products.current) return

  image.value = products.current.image || ''
}

function syncForm() {
  syncTextFields()
  syncImage()
}

function addFlavorNote() {
  form.value.flavorNotes.push('')
}

function removeFlavorNote(index: number) {
  form.value.flavorNotes.splice(index, 1)
}

async function saveProduct() {
  try {
    await products.saveProduct(slug.value, activeLocale.value, form.value)
    await imagesEditorRef.value?.commit()
    syncForm()
  } catch {
    // error in store
  }
}

const saveLabel = computed(() => {
  if (products.saving || products.uploadingImage || products.imageSaving) {
    return 'Сохранение…'
  }

  return 'Сохранить'
})

async function removeProduct() {
  try {
    await products.deleteProduct(slug.value)
    await navigateTo('/products')
  } catch {
    // error in store
  }
}

watch(activeLocale, () => {
  syncTextFields()
})

onMounted(async () => {
  await products.fetchProduct(slug.value)
  syncForm()
})
</script>
