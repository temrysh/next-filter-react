import { Range } from 'react-input-range'
import { ProductNode } from './schema'
import { FilterMap } from "../components/filters"

export const trimTag = (tag: string) => tag.trim().toLocaleLowerCase().replace('#', '')

export const getFilteredList = (edges: ProductNode[], filters: FilterMap, priceLimits: Range): ProductNode[] => {
  const { colors, tags, priceRange } = filters

  return edges.filter(({ node }) => {
    const price = Number(node.shopifyProductEu.variants.edges[0].node.price)

    // color category filtering
    if (colors.length && (!node.colorFamily || !colors.includes(node.colorFamily[0].name))) return false

    // tags sets matching
    if (tags.length) {
      const isSomeTagsIncludes = node.categoryTags?.reduce((isSomeFound: boolean, tag) => {
        if (isSomeFound) return isSomeFound
        return tags.includes(trimTag(tag))
      }, false)

      if (!isSomeTagsIncludes) return false
    }

    // price filtering
    if (priceRange.min !== priceLimits.min) {
      if (Math.min(priceRange.min, price) === price) return false
    }

    if (priceRange.max !== priceLimits.max) {
      if (Math.max(priceRange.max, price) === price) return false
    }

    return true
  })
}