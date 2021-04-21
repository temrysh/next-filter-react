import useSWR, { SWRConfiguration } from 'swr'
import { useRouter } from 'next/router'
import Item from './item'
import { ProductNode } from '../utils/schema'
import { QueryParams } from '../utils/query-params'

const apiBase = '/api/list'
const fetcher = (url: string) => fetch(url).then(res => res.json())

type Props = {
  cursor: number,
  initialData?: ProductNode[],
  checkForMore?: (notEmpty: boolean) => void,
}

const Page = ({ cursor, initialData, checkForMore }: Props) => {
  const { asPath } = useRouter()
  const path = asPath.substring(1)
  const cursorPrefix = path.includes('?') ? '&' : '?'
  const url = `${apiBase}${path}${cursorPrefix}${QueryParams.Cursor}=${cursor}`
  const options: SWRConfiguration = {
    revalidateOnFocus: false
  }

  if (initialData) options.initialData = { list: initialData }

  const { data } = useSWR(url, fetcher, options)

  data && checkForMore && checkForMore(data?.list.length !== 0)

  return (
    <>
      {
        (data?.list || []).map((productNode: ProductNode) => <Item data={productNode} key={productNode.node.name} />)
      }
    </>
  )
}

export default Page