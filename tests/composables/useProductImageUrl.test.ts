import { describe, expect, it } from 'vitest'
import { useProductImageUrl } from '~/composables/useProductImageUrl'

describe('useProductImageUrl', () => {
  it('returns empty string for empty path', () => {
    const { resolveImageUrl } = useProductImageUrl()

    expect(resolveImageUrl('')).toBe('')
  })

  it('returns absolute URLs unchanged', () => {
    const { resolveImageUrl } = useProductImageUrl()
    const url = 'https://cdn.example.com/image.jpg'

    expect(resolveImageUrl(url)).toBe(url)
  })

  it('resolves relative paths against API origin', () => {
    const { resolveImageUrl } = useProductImageUrl()

    expect(resolveImageUrl('/uploads/coffee.jpg')).toBe('http://localhost:3001/uploads/coffee.jpg')
    expect(resolveImageUrl('uploads/coffee.jpg')).toBe('http://localhost:3001/uploads/coffee.jpg')
  })
})
