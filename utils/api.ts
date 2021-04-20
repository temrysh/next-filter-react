import memoize from 'memoizee'

export const getJSON = memoize(async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  return json
}, { promise: true })