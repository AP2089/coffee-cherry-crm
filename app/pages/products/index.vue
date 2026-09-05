<template>
  <NuxtLayout name="app">
    <LayoutAppHeader title="Товары" subtitle="Управление каталогом" />

    <div ref="listEl" class="flex-1 overflow-y-auto p-4 md:p-6">
      <div class="mb-4 flex justify-end">
        <Button variant="magnetic-filled" @click="onAddProduct"> Добавить товар </Button>
      </div>

      <p
        v-if="!products.initialized || (products.loading && !products.items.length)"
        class="py-16 text-center text-sm text-muted-foreground"
      >
        Загрузка…
      </p>

      <Alert v-else-if="products.error && !products.items.length" variant="destructive">
        <AlertDescription>{{ products.error }}</AlertDescription>
      </Alert>

      <div
        v-else-if="products.initialized && !products.items.length"
        class="rounded-sm border border-dashed border-border px-6 py-16 text-center"
      >
        <p class="font-display text-lg">Товаров нет</p>
        <Button class="mt-4" variant="outline" @click="onAddProduct">
          Добавить первый товар
        </Button>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in products.items"
          :key="item._id"
          class="rounded-sm border border-border bg-card transition-colors hover:border-bronze/40"
        >
          <div class="flex items-center justify-between gap-4 p-4 md:p-5">
            <NuxtLink :to="`/products/${item.slug}`" class="min-w-0 flex-1">
              <p class="font-display text-lg capitalize">{{ item.name }}</p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ item.country }} · {{ item.region }}
              </p>
            </NuxtLink>

            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-sm">{{ formatPrice(item.price) }}</p>
                <p class="mt-1 text-xs text-muted-foreground">остаток: {{ item.stock }}</p>
              </div>

              <Button v-if="!canEdit" size="sm" variant="destructive" @click.stop="assertCanEdit()">
                Удалить
              </Button>
              <AlertDialog v-else>
                <AlertDialogTrigger as-child>
                  <Button
                    size="sm"
                    variant="destructive"
                    :disabled="products.deleting === item.slug"
                    @click.stop
                  >
                    Удалить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {{ item.name }} будет удалён из каталога вместе с переводами.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction @click="removeProduct(item.slug)">
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <p v-if="products.loadingMore" class="py-3 text-center text-xs text-muted-foreground">
          Загрузка…
        </p>

        <p
          v-else-if="!products.hasMore"
          class="py-3 text-center text-[10px] uppercase tracking-[0.08em] text-muted-foreground/50"
        >
          Все товары загружены
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { formatPrice } from '~/utils/format'

definePageMeta({
  layout: false,
  ssr: false,
})

const products = useProductsStore()
const listEl = ref<HTMLElement | null>(null)
const { canEdit, assertCanEdit } = useCanEdit()

useCrmInfiniteScroll({
  listEl,
  hasMore: () => products.hasMore,
  loading: () => products.loading,
  loadingMore: () => products.loadingMore,
  loadMore: () => products.loadMoreProducts(),
  itemsLength: () => products.items.length,
})

function onAddProduct() {
  if (!assertCanEdit()) return
  void navigateTo('/products/new')
}

async function removeProduct(slug: string) {
  if (!assertCanEdit()) return

  try {
    await products.deleteProduct(slug)
  } catch {
    // error in store
  }
}

onMounted(async () => {
  await products.fetchProducts()
})
</script>
