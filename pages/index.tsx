import { useState } from 'react'
import Head from "next/head"
import { Range } from 'react-input-range'
import styles from "../styles/Home.module.css"
import Filters, { FilterMap } from "../components/filters"
import List from "../components/list"
import { ProductNode, ApiResponse } from '../utils/schema'

type Props = {
  edges: ProductNode[]
  colors: string[]
  tags: string[]
  priceLimits: Range
}

const trimTag = (tag: string) => tag.trim().toLocaleLowerCase().replace('#', '')

const getFilteredList = (edges: ProductNode[], filters: FilterMap, priceLimits: Range): ProductNode[] => {
  const { colors, tags, priceRange } = filters
  console.log({ priceRange, priceLimits })

  return edges.filter(({ node }) => {
    const price: number = Number(node.shopifyProductEu.variants.edges[0].node.price)

    if (colors.length && (!node.colorFamily || !colors.includes(node.colorFamily[0].name))) return false

    if (tags.length) {
      const isSomeTagsIncludes = node.categoryTags?.reduce((acc: boolean, tag) => {
        if (acc) return acc
        return tags.includes(trimTag(tag))
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

const Home = ({ edges, colors, tags, priceLimits }: Props) => {
  const [filters, setFilters] = useState<FilterMap>({ colors: [], tags: [], priceRange: priceLimits })

  console.time('filter')
  const list = getFilteredList(edges, filters, priceLimits)
  console.timeEnd('filter')

  console.log({ filters, list })

  return (
    <div className={styles.container}>
      <Head>
        <title>Next Filter React</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Filters colors={colors} tags={tags} priceLimits={priceLimits} onSubmit={filters => setFilters(filters)} />
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
    node.colorFamily?.forEach(({ name }) => targets.colors.add(name))
    node.categoryTags?.forEach(tag => targets.tags.add(trimTag(tag)))
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
