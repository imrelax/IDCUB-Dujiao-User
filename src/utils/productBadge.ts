import xiabibiConfig from '../assets/xiabibi.json'

export interface ProductBadge {
  key: string
  label: string | { [lang: string]: string }
  gradient: string
  weight: number
}

export type LocalizedText = { [lang: string]: string }

export function resolveLocalizedText(label: string | LocalizedText | undefined, locale: string): string {
  if (!label) return ''
  if (typeof label === 'string') return label
  return label[locale] || label['zh-CN'] || label['en-US'] || ''
}

export function getProductBadge(productId: number | string): ProductBadge | null {
  const badges = (xiabibiConfig.productBadges as any)?.items || []
  let matchedBadge: ProductBadge | null = null
  let maxWeight = -1
  const currentId = Number(productId)

  for (const b of badges) {
    const ids = b.productIds || []
    const hasMatch = ids.some((id: number | string) => Number(id) === currentId)
    if (hasMatch && b.weight > maxWeight) {
      matchedBadge = {
        key: b.key,
        label: b.label,
        gradient: b.gradient,
        weight: b.weight
      }
      maxWeight = b.weight
    }
  }

  return matchedBadge
}

export function getProductBadgeWeight(productId: number | string): number {
  const badge = getProductBadge(productId)
  return badge ? badge.weight : -1
}

export function sortProductsByBadge<T extends { id: number | string }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const weightA = getProductBadgeWeight(a.id)
    const weightB = getProductBadgeWeight(b.id)

    if (weightA >= 0 && weightB < 0) return -1
    if (weightA < 0 && weightB >= 0) return 1
    if (weightA >= 0 && weightB >= 0) return weightB - weightA

    return 0
  })
}

export interface MarketingTitle {
  id: number
  label: string | LocalizedText
  gradient: string
}

export function getMarketingTitle(productId: number | string, _locale: string): MarketingTitle | null {
  const items = (xiabibiConfig.marketingTitles as any)?.items || []
  if (items.length === 0) return null
  const currentId = Number(productId)
  for (const item of items) {
    const ids: number[] = item.productIds || []
    if (ids.some((id: number | string) => Number(id) === currentId)) {
      return {
        id: item.id,
        label: item.label,
        gradient: item.gradient,
      }
    }
  }
  return null
}
