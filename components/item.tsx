import Image from "next/image"
import styled from '@emotion/styled'
import { ProductNode } from '../utils/schema'

type Props = {
  data: ProductNode
}

const Container = styled.div`
  height: 400px;
  margin: 10px;
  display: flex;
`
const Details = styled.div`
  margin: 10px;
`

const Name = styled.div`
  font-size: 22px;
`

const Item = ({ data: { node } }: Props) =>
(<Container>
  <Image
    width={400}
    height={400}
    priority
    src={`https:${node.thumbnailImage.file.url}`}
    alt={node.name}
  />
  <Details>
    <Name>{node.name}</Name>
    {node?.shopifyProductEu?.variants?.edges?.length && node.shopifyProductEu.variants.edges[0].node.price && <div><span>Price:</span>{node.shopifyProductEu.variants.edges[0].node.price}</div>}
    {node?.colorFamily?.length && node.colorFamily[0] && <div><span>Color:</span>{node.colorFamily[0].name}</div>}
    {node?.categoryTags?.length && node.categoryTags && <div><span>Tags:</span>{node.categoryTags.map(tag => <span>{tag}</span>)}</div>}
  </Details>
</Container>
)

export default Item