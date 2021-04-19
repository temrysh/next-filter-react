import { useState } from 'react'
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare'
import { useRouter } from 'next/router'
import Head from "next/head"
import { Range } from 'react-input-range'
import styles from "../styles/Home.module.css"
import Filters, { FilterMap } from "../components/filters"
import List from "../components/list"
import { ProductNode, ApiResponse } from '../utils/schema'
import { getFilters, filtersToQuery, cropString, getFilteredList } from '../utils/helpers'

type Props = {
  edges: ProductNode[]
  colors: string[]
  tags: string[]
  priceLimits: Range
}

const Home = ({ edges, colors, tags, priceLimits }: Props) => {
  const router = useRouter()
  const { query } = router
  const initFilters: FilterMap = getFilters(query, priceLimits)
  const [filters, setFilters] = useState<FilterMap>(initFilters)
  const list = useDeepCompareMemo<ProductNode[]>(() => getFilteredList(edges, filters, priceLimits), [filters])

  const setQueryParams = (filters: FilterMap) => {
    router.push(
      { query: filtersToQuery(filters) },
      undefined,
      { shallow: true }
    )
  }

  useDeepCompareEffect(() => {
    setFilters(getFilters(query, priceLimits))
  }, [query])

  return (
    <div className={styles.container}>
      <Head>
        <title>Next Filter React</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Filters filters={{ colors, tags, priceRange: priceLimits }} initFilters={initFilters} onSubmit={filters => setQueryParams(filters)} />
      <List data={list} />
    </div>
  )
}

export default Home

export async function getStaticProps() {
  const res = await fetch(
    "https://dl.dropbox.com/s/iebly5coc7dg8pe/miista-export.json"
  )
  const json: ApiResponse = await res.json()
  const { edges } = json.data.allContentfulProductPage
  const filterOptions = {
    colors: new Set(),
    tags: new Set(),
    prices: new Set(),
  }

  edges.reduce((targets, { node }) => {
    node.colorFamily?.forEach(({ name }) => targets.colors.add(cropString(name)))
    node.categoryTags?.forEach(tag => targets.tags.add(cropString(tag)))
    node.shopifyProductEu.variants.edges?.forEach(({ node: { price } }) => targets.prices.add(price))
    return targets
  }, filterOptions)

  const [colors, tags, prices] = Object.values(filterOptions).map(s => Array.from(s).sort())
  const priceLimits = prices.reduce((acc: Range, price: string) => ({
    min: Math.min(acc.min, Number(price)),
    max: Math.max(acc.max, Number(price))
  }), { min: prices[0], max: prices[0] })

  return {
    props: {
      edges,
      colors,
      tags,
      priceLimits,
    },
  }
}
