import Head from "next/head"
import { Range } from 'react-input-range'
import styles from "../styles/Home.module.css"
import Filters from "../components/filters"
import List from "../components/list"
import { ProductNode, ApiResponse } from '../utils/schema'

type Props = {
  edges: ProductNode[]
  colors: string[]
  tags: string[]
  priceLimits: Range
}

const Home = ({ edges, colors, tags, priceLimits }: Props) => (
  <div className={styles.container}>
    <Head>
      <title>Next Filter React</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Filters colors={colors} tags={tags} priceLimits={priceLimits} onSubmit={filters => console.log({ filters })} />
    <List edges={edges} />
  </div>
)

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
    node.categoryTags?.forEach(tag => targets.tags.add(tag.trim().toLocaleLowerCase().replace('#', '')))
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
