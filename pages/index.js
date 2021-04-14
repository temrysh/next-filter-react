import { useState, memo } from "react"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import InfiniteLoader from "react-window-infinite-loader"
import styles from "../styles/Home.module.css"

export default function Home({ edges, colorFamilies, categoryTags, prices }) {
  const router = useRouter()
  const [list, setList] = useState([])
  const itemCount = edges.length

  const isItemLoaded = ({ index }) => !!list[index]

  const loadMoreItems = ({ startIndex, stopIndex }) =>
    new Promise((resolve) =>
      resolve(edges.slice(startIndex, stopIndex))
    ).then((data) => setList([...list, ...data]))

  const imageLoader = ({ src }) => `http:${src}`

  return (
    <div className={styles.container}>
      <Head>
        <title>Next Filter React</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <List
                onItemsRendered={onItemsRendered}
                ref={ref}
                height={height}
                width={width}
                itemSize={500}
                itemCount={itemCount}
              >
                {({ index, style }) => (
                  <div style={style}>
                    {list[index] && (
                      <>
                        <Image
                          loader={imageLoader}
                          width={500}
                          height={500}
                          priority
                          src={list[index].node.thumbnailImage.file.url}
                          alt={list[index].node.name}
                        />
                        <span>{list[index].node.name}</span>
                      </>
                    )}
                  </div>
                )}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  )
}

export async function getStaticProps() {
  const res = await fetch(
    "https://dl.dropbox.com/s/iebly5coc7dg8pe/miista-export.json"
  )
  const json = await res.json()
  const { edges } = json.data.allContentfulProductPage

  const colorFamilies = Array.from(
    edges.reduce((set, { node }) => {
      node.colorFamily && node.colorFamily.forEach(({ name }) => set.add(name))
      return set
    }, new Set())
  )

  const categoryTags = Array.from(
    edges.reduce((set, { node }) => {
      node.categoryTags &&
        node.categoryTags.forEach((tag) => set.add(tag.trim()))
      return set
    }, new Set())
  )

  const prices = Array.from(
    edges.reduce((set, { node }) => {
      node.shopifyProductEu.variants.edges.forEach(({ node: { price } }) =>
        set.add((price * 100) / 100)
      )
      return set
    }, new Set())
  )

  return {
    props: {
      edges,
      colorFamilies,
      categoryTags,
      prices,
    },
  }
}
