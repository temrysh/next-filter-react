import { Range } from 'react-input-range'
import { useRouter } from 'next/router'
import Head from "next/head"
import styles from "../styles/Home.module.css"
import Filters, { FilterMap } from "../components/filters"
import List from "../components/list"
import { ProductNode, ApiResponse } from '../utils/schema'
import { getJSON } from '../utils/api'
import { getFilters, filtersToQuery, cropString, getFilteredList } from '../utils/helpers'

type Props = {
  list: ProductNode[]
  filters: FilterMap,
  filterOptions: FilterMap,
}

const Home = ({ list, filters, filterOptions }: Props) => {
  const router = useRouter()
  const setQueryParams = (filters: FilterMap) => {
    router.push({ query: filtersToQuery(filters, filterOptions.priceRange) })
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Next Filter React</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Filters filters={filters} filterOptions={filterOptions} onSubmit={filters => setQueryParams(filters)} />
      <List data={list} resetTrigger={router.asPath} />
    </div>
  )
}

export default Home

export async function getServerSideProps({ query }) {
  const json: ApiResponse = await getJSON("https://dl.dropbox.com/s/iebly5coc7dg8pe/miista-export.json")
  const { edges } = json.data.allContentfulProductPage

  const filterOptionsMap = edges.reduce((targets, { node }) => {
    node.colorFamily?.forEach(({ name }) => targets.colors.add(cropString(name)))
    node.categoryTags?.forEach((tag: string) => targets.tags.add(cropString(tag)))
    node.shopifyProductEu.variants.edges?.forEach(({ node: { price } }) => targets.prices.add(price))
    return targets
  }, {
    colors: new Set<string>(),
    tags: new Set<string>(),
    prices: new Set<string>(),
  })

  const [colors, tags, prices] = Object.values(filterOptionsMap).map((s: Set<string>) => Array.from(s).sort())

  const priceRange: Range = prices.reduce((acc: Range, price: string): Range => ({
    min: Math.min(acc.min, Number(price)),
    max: Math.max(acc.max, Number(price))
  }), { min: Number(prices[0]), max: Number(prices[0]) })

  const filters = getFilters(query, priceRange)
  const list = getFilteredList(edges, filters, priceRange).slice(0, 10)

  return {
    props: {
      list,
      filters,
      filterOptions: {
        colors,
        tags,
        priceRange,
      }
    },
  }
}