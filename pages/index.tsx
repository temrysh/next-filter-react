import Head from "next/head"
import styles from "../styles/Home.module.css"
import Filters from "../components/filters"
import List from "../components/list"
import { ProductNode, ApiResponse } from '../utils/schema'

type Props = {
  edges: ProductNode[]
  colors: string[]
  tags: string[]
  prices: string[]
}

const Home = ({ edges, colors, tags, prices }: Props) => (
  <div className={styles.container}>
    <Head>
      <title>Next Filter React</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Filters colors={colors} />
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

  const filterTargets = {
    colors: new Set(),
    tags: new Set(),
    prices: new Set(),
  }

  edges.reduce((targets, { node }) => {
    node.colorFamily?.forEach(({ name }) => targets.colors.add(name))
    node.categoryTags?.forEach(tag => targets.tags.add(tag.trim()))
    node.shopifyProductEu.variants.edges?.forEach(({ node: { price } }) => targets.prices.add(price))
    return targets
  }, filterTargets)

  const [colors, tags, prices] = Object.values(filterTargets).map(s => Array.from(s))

  return {
    props: {
      edges,
      colors,
      tags,
      prices,
    },
  }
}
