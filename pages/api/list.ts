import { Range } from 'react-input-range'
import { ApiResponse } from '../../utils/schema'
import { getJSON } from '../../utils/api'
import { getFilters, getFilteredList } from '../../utils/helpers'
import { QueryParams } from '../../utils/query-params'

export default async function handler({ query }, res) {
  const json: ApiResponse = await getJSON("https://dl.dropbox.com/s/iebly5coc7dg8pe/miista-export.json")
  const { edges } = json.data.allContentfulProductPage

  const cursor = (Number(query[QueryParams.Cursor]) ?? 0) * 10
  const firstPrice = Number(edges[0].node.shopifyProductEu.variants.edges[0].node.price)

  const priceRange: Range = edges.reduce((acc: Range, { node }): Range => {
    const { price } = node.shopifyProductEu.variants.edges[0].node
    return {
      min: Math.min(acc.min, Number(price)),
      max: Math.max(acc.max, Number(price))
    }
  }, { min: firstPrice, max: firstPrice })

  const filters = getFilters(query, priceRange)
  const list = getFilteredList(edges, filters, priceRange).slice(cursor, cursor + 10)

  res.status(200).json({ list })
}