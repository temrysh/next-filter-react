import { useState } from 'react'
import Head from "next/head"
import { Range } from 'react-input-range'
import styles from "../styles/Home.module.css"
import Filters, { FilterMap } from "../components/filters"
import List from "../components/list"
import { ProductNode, ApiResponse } from '../utils/schema'
import { trimTag, getFilteredList } from '../utils/helpers'

type Props = {
  edges: ProductNode[]
  colors: string[]
  tags: string[]
  priceLimits: Range
}

const Home = ({ edges, colors, tags, priceLimits }: Props) => {
  const [filters, setFilters] = useState<FilterMap>({ colors: [], tags: [], priceRange: priceLimits })

  // console.time('getFilteredList')
  const list = getFilteredList(edges, filters, priceLimits)
  // console.timeEnd('getFilteredList')
  // Max vals when all filters enabled in dev env:
  // for 383 items => 0.933837890625 ms // assignment list
  // for 3830 items => 10.008056640625 ms // so 2000+ is OK
  // for 38300 items => 30.0478515625 ms // init load speed is slightly noticeable here, but OK
  // for 383000 items => 293.966796875 ms // init load speed is annoying here, NOT OK, BE chunking needed
  // 5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36 
  // MacBook Pro Mid 2014

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
