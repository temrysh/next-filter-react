export type ColorFamily = [{ name: string }]

export type CategoryTags = string[]

export type PriceNode = { node: { price: string } }

export type ProductNode = {
  node: {
    name: string
    node_locale: string
    thumbnailImage: {
      file: {
        url: string
      }
    }
    colorFamily: ColorFamily
    categoryTags: CategoryTags
    shopifyProductEu: {
      variants: {
        edges: PriceNode[]
      }
    }
  }
}

export type ApiResponse = {
  data: {
    allContentfulProductPage: {
      edges: ProductNode[]
    }
  }
}