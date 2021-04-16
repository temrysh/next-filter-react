import { useRef } from "react"
import Image from "next/image"
import { FixedSizeList } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import InfiniteLoader from "react-window-infinite-loader"

type Props = {
  data: any[],
}

const List = ({ data }: Props) => {
  const list = useRef([])
  const itemCount = data.length

  const isItemLoaded = ({ index }) => !!list.current[index]

  const loadMoreItems = ({ startIndex, stopIndex }) =>
    new Promise((resolve) => resolve(data.slice(startIndex, stopIndex))).then(
      (data: []) => (list.current = [...list.current, ...data])
    )

  const Item = ({ index, style }) =>
    list.current[index] ? (
      <div style={style}>
        <Image
          width={500}
          height={500}
          priority
          src={`https:${list.current[index].node.thumbnailImage.file.url}`}
          alt={list.current[index].node.name}
        />
        <span>{list.current[index].node.name}</span>
      </div>
    ) : null
  return (
    <AutoSizer>
      {({ height, width }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
        >
          {({ onItemsRendered, ref }) => (
            <FixedSizeList
              onItemsRendered={onItemsRendered}
              ref={ref}
              height={height}
              width={width}
              itemSize={500}
              itemCount={itemCount}
            >
              {Item}
            </FixedSizeList>
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>)
}

export default List