import { useState, useEffect } from "react"
import styled from '@emotion/styled'
import Page from './page'
import { ProductNode } from '../utils/schema'

type Props = {
  data: ProductNode[],
  resetTrigger: string,
}

const Container = styled.div`
  height: 100vh;
  overflow-y: scroll;
`
const LoadMoreBtn = styled.button`
  display: block;
  width: 400px;
  height: 40px;
  margin: 10px;
`

const List = ({ data, resetTrigger }: Props) => {
  const [cursor, setCursor] = useState<number>(0)
  const [isMore, setIsMore] = useState<boolean>(true)

  useEffect(() => {
    setCursor(0)
  }, [resetTrigger])

  return (
    <Container>
      <Page cursor={0} initialData={data} key={0} />
      {Array(cursor).fill(1).map((_, idx) => <Page cursor={idx + 1} key={idx + 1} />)}
      <div style={{ display: 'none' }}><Page cursor={cursor + 1} checkForMore={isMore => setIsMore(isMore)} /></div>
      {isMore && <LoadMoreBtn onClick={() => setCursor(cursor + 1)}>Load more</LoadMoreBtn>}
    </Container>
  )
}

export default List