import { Range } from 'react-input-range'
import { ParsedUrlQuery } from 'querystring'
import { ProductNode } from './schema'
import { QueryParams } from './query-params'
import { FilterMap } from "../components/filters"

type Params = string | string[]

export const getInitParams = (params: Params): string[] => params ? (Array.isArray(params) ? params : [params]) : []

export const getNumberParams = (params: Params): number | null => {
  if (Array.isArray(params)) return null
  const n = Number(params)
  if (!Number.isInteger(n)) return null
  return n
}

export const getInitRange = (minParams: Params, maxParams: Params, priceLimits: Range): Range => ({
  min: getNumberParams(minParams) ?? priceLimits.min,
  max: getNumberParams(maxParams) ?? priceLimits.max,
})

export const getFilters = (query: ParsedUrlQuery, priceLimits: Range) => ({
  colors: getInitParams(query[QueryParams.Color]),
  tags: getInitParams(query[QueryParams.Tag]),
  priceRange: getInitRange(query[QueryParams.Min], query[QueryParams.Max], priceLimits)
})

export const filtersToQuery = (filters: FilterMap, priceLimits: Range): ParsedUrlQuery => {
  const query = {}
  const { colors, tags, priceRange: { min, max } } = filters

  if (colors && colors.length) query[QueryParams.Color] = colors
  if (tags && tags.length) query[QueryParams.Tag] = tags
  if (min && min !== priceLimits.min) query[QueryParams.Min] = min
  if (max && max !== priceLimits.max) query[QueryParams.Max] = max

  return query
}

export const cropString = (tag: string) => tag.trim().toLocaleLowerCase().replace('#', '')

export const getFilteredList = (edges: ProductNode[], filters: FilterMap, priceLimits: Range): ProductNode[] => {
  const { colors, tags, priceRange } = filters

  return edges.filter(({ node }) => {
    const price = Number(node.shopifyProductEu.variants.edges[0].node.price)

    if (colors.length && (!node.colorFamily || !colors.includes(cropString(node.colorFamily[0].name)))) return false

    if (tags.length) {
      const isSomeTagsIncludes = node.categoryTags?.reduce((isSomeFound: boolean, tag) => {
        if (isSomeFound) return isSomeFound
        return tags.includes(cropString(tag))
      }, false)

      if (!isSomeTagsIncludes) return false
    }

    if (priceRange.min !== priceLimits.min) {
      if (Math.min(priceRange.min, price) === price) return false
    }

    if (priceRange.max !== priceLimits.max) {
      if (Math.max(priceRange.max, price) === price) return false
    }

    return true
  })
}