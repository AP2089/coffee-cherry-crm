import { useInfiniteScroll } from '@vueuse/core'

interface CrmInfiniteScrollOptions {
  listEl: Ref<HTMLElement | null>
  hasMore: () => boolean
  loading: () => boolean
  loadingMore: () => boolean
  loadMore: () => Promise<void>
  itemsLength: () => number
}

function isUnderfilled(element: HTMLElement) {
  return element.scrollHeight <= element.clientHeight + 1
}

export function useCrmInfiniteScroll(options: CrmInfiniteScrollOptions) {
  useInfiniteScroll(
    options.listEl,
    () => options.loadMore(),
    {
      distance: 80,
      canLoadMore: () =>
        options.hasMore() && !options.loading() && !options.loadingMore(),
    },
  )

  async function ensureFilled() {
    if (!options.hasMore() || options.loading()) return

    await nextTick()

    let guard = 0
    while (
      guard < 5 &&
      options.hasMore() &&
      !options.loading() &&
      !options.loadingMore()
    ) {
      const element = options.listEl.value
      if (!element || !isUnderfilled(element)) break

      guard += 1
      await options.loadMore()
      await nextTick()
    }
  }

  watch(
    () => [options.loading(), options.hasMore(), options.itemsLength()] as const,
    async ([loading, hasMore]) => {
      if (loading || !hasMore) return
      await ensureFilled()
    },
  )

  onMounted(async () => {
    await ensureFilled()
  })
}
