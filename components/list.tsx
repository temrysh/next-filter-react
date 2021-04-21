import { useState, useEffect } from "react"
import Page from './page'
import { ProductNode } from '../utils/schema'

type Props = {
  data: ProductNode[],
  resetTrigger: string,
}

const List = ({ data, resetTrigger }: Props) => {
  const [cursor, setCursor] = useState<number>(0)

  useEffect(() => {
    setCursor(0)
  }, [resetTrigger])

  return (
    <div>
      <Page cursor={0} initialData={data} key={0} />
      {Array(cursor).fill(1).map((_, idx) => <Page cursor={idx + 1} key={idx + 1} />)}
      <button onClick={() => setCursor(cursor + 1)}>Load more</button>
      <div style={{ display: 'none' }}><Page cursor={cursor + 1} /></div>
    </div>
  )
}

export default List