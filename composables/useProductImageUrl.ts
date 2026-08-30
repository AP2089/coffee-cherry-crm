export function useProductImageUrl() {
  function resolveImageUrl(path: string): string {
    if (!path) return ''

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    const apiBase = useApiBase().replace(/\/$/, '')
    const origin = apiBase.replace(/\/api$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    return `${origin}${normalizedPath}`
  }

  return { resolveImageUrl }
}
