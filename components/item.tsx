import Image from "next/image"
import { ProductNode } from '../utils/schema'

type Props = {
  data: ProductNode
}

const Item = ({ data: { node } }: Props) =>
(<div>
  <Image
    width={500}
    height={500}
    priority
    src={`https:${node.thumbnailImage.file.url}`}
    alt={node.name}
  />
  <span>{node.name}</span>
</div>
)

export default Item