import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'

export function useAPIContent<T = unknown>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
): AsyncData<T, FetchError> {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$apiContent,
  }) as AsyncData<T, FetchError>
}
