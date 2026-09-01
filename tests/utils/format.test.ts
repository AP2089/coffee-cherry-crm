import { describe, expect, it } from 'vitest'
import { contactStatusLabels, formatDate, formatPrice, orderStatusLabels } from '~/utils/format'

describe('format utils', () => {
  it('formatDate returns em dash for empty value', () => {
    expect(formatDate()).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('formatDate formats valid ISO string in ru-RU locale', () => {
    const formatted = formatDate('2026-03-15T14:30:00.000Z')

    expect(formatted).toContain('2026')
    expect(formatted).toMatch(/\d{2}:\d{2}/)
  })

  it('formatPrice formats RUB without fraction digits', () => {
    expect(formatPrice(1500)).toMatch(/1\s?500/)
    expect(formatPrice(1500)).toMatch(/₽|RUB/)
  })

  it('exposes contact and order status labels', () => {
    expect(contactStatusLabels.new).toBe('Новое')
    expect(orderStatusLabels.pending).toBe('Ожидает')
  })
})
