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

  // Max vals when all filters enabled in dev env (for comparison: toolbeer.dk filter takes minimum 160 ms):
  // for 383 items => 0.933837890625 ms // assignment list
  // for 3830 items => 10.008056640625 ms // so 2000+ is OK
  // for 38300 items => 30.0478515625 ms // init load speed is slightly noticeable here (apprx 100ms more), but OK
  // for 383000 items => 293.966796875 ms // init load speed is annoying here, NOT OK, BE chunking needed
  // 5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36 
  // MacBook Pro Mid 2014

  const { colors, tags, priceRange } = filters

  return edges.filter(({ node }) => {
    const price = Number(node.shopifyProductEu.variants.edges[0].node.price)

    // color category filtering
    if (colors.length && (!node.colorFamily || !colors.includes(cropString(node.colorFamily[0].name)))) return false

    // tags sets matching
    if (tags.length) {
      const isSomeTagsIncludes = node.categoryTags?.reduce((isSomeFound: boolean, tag) => {
        if (isSomeFound) return isSomeFound
        return tags.includes(cropString(tag))
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