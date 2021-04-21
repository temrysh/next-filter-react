import { getInitParams, getNumberParams, getInitRange, getFilters, filtersToQuery, cropString, getFilteredList } from './helpers'
import { QueryParams } from './query-params'
import { ProductNode } from './schema'

describe('getInitParams', () => {
  test('should return params from string', () => {
    const actual = getInitParams('test')
    const expected = ['test']
    expect(actual).toStrictEqual(expected)
  })

  test('should return params from array', () => {
    const actual = getInitParams(['test', 'test2'])
    const expected = ['test', 'test2']
    expect(actual).toStrictEqual(expected)
  })
})

describe('getNumberParams', () => {
  test('should return number', () => {
    const actual = getNumberParams('1')
    const expected = 1
    expect(actual).toStrictEqual(expected)
  })

  test('should return null for array', () => {
    const actual = getNumberParams(['1'])
    const expected = null
    expect(actual).toStrictEqual(expected)
  })

  test('should return null for fixed', () => {
    const actual = getNumberParams('1.2')
    const expected = null
    expect(actual).toStrictEqual(expected)
  })

  test('should return null for empty string', () => {
    const actual = getNumberParams('')
    const expected = null
    expect(actual).toStrictEqual(expected)
  })

  test('should return null for NaN', () => {
    const actual = getNumberParams('a')
    const expected = null
    expect(actual).toStrictEqual(expected)
  })
})

describe('getInitRange', () => {
  test('should return same as priceLimits', () => {
    const priceLimits = { min: 0, max: 100 }
    const actual = getInitRange('0', '100', priceLimits)
    const expected = { min: 0, max: 100 }
    expect(actual).toStrictEqual(expected)
  })

  test('should return same as priceLimits', () => {
    const priceLimits = { min: 10, max: 100 }
    const actual = getInitRange('10', '100', priceLimits)
    const expected = { min: 10, max: 100 }
    expect(actual).toStrictEqual(expected)
  })

  test('should return same as priceLimits', () => {
    const priceLimits = { min: 0, max: 100 }
    const actual = getInitRange('', '', priceLimits)
    const expected = { min: 0, max: 100 }
    expect(actual).toStrictEqual(expected)
  })

  test('should return smaller max than priceLimits', () => {
    const priceLimits = { min: 0, max: 100 }
    const actual = getInitRange('0', '10', priceLimits)
    const expected = { min: 0, max: 10 }
    expect(actual).toStrictEqual(expected)
  })

  test('should return bigger min than priceLimits', () => {
    const priceLimits = { min: 0, max: 100 }
    const actual = getInitRange('10', '100', priceLimits)
    const expected = { min: 10, max: 100 }
    expect(actual).toStrictEqual(expected)
  })
})

describe('getFilters', () => {
  test('should return filters for empty query', () => {
    const query = {}
    const priceRange = { min: 0, max: 100 }
    const actual = getFilters(query, priceRange)
    const expected = { colors: [], tags: [], priceRange }
    expect(actual).toStrictEqual(expected)
  })

  test('should return filters with colors', () => {
    const query = { [QueryParams.Color]: ['black', 'white'] }
    const priceRange = { min: 0, max: 100 }
    const actual = getFilters(query, priceRange)
    const expected = { colors: ['black', 'white'], tags: [], priceRange }
    expect(actual).toStrictEqual(expected)
  })

  test('should return filters with tags', () => {
    const query = { [QueryParams.Tag]: ['black', 'white'] }
    const priceRange = { min: 0, max: 100 }
    const actual = getFilters(query, priceRange)
    const expected = { colors: [], tags: ['black', 'white'], priceRange }
    expect(actual).toStrictEqual(expected)
  })

  test('should return filters with non default min max', () => {
    const query = { [QueryParams.Min]: '10', [QueryParams.Max]: '1000' }
    const priceRange = { min: 0, max: 100 }
    const actual = getFilters(query, priceRange)
    const expected = { colors: [], tags: [], priceRange: { min: 10, max: 1000 } }
    expect(actual).toStrictEqual(expected)
  })

  test('should return filters for full query', () => {
    const query = {
      [QueryParams.Color]: ['black', 'white'],
      [QueryParams.Tag]: ['black', 'white'],
      [QueryParams.Min]: '10',
      [QueryParams.Max]: '1000'
    }
    const priceRange = { min: 0, max: 100 }
    const actual = getFilters(query, priceRange)
    const expected = {
      colors: ['black', 'white'],
      tags: ['black', 'white'],
      priceRange: { min: 10, max: 1000 }
    }
    expect(actual).toStrictEqual(expected)
  })
})

describe('filtersToQuery', () => {
  test('should return empty query', () => {
    const priceRange = { min: 0, max: 100 }
    const filters = { colors: [], tags: [], priceRange }
    const actual = filtersToQuery(filters, priceRange)
    const expected = {}
    expect(actual).toStrictEqual(expected)
  })

  test('should return query with colors', () => {
    const priceRange = { min: 0, max: 100 }
    const filters = { colors: ['black', 'white'], tags: [], priceRange }
    const actual = filtersToQuery(filters, priceRange)
    const expected = { [QueryParams.Color]: ['black', 'white'] }
    expect(actual).toStrictEqual(expected)
  })

  test('should return query with tags', () => {
    const priceRange = { min: 0, max: 100 }
    const filters = { colors: [], tags: ['black', 'white'], priceRange }
    const actual = filtersToQuery(filters, priceRange)
    const expected = { [QueryParams.Tag]: ['black', 'white'] }
    expect(actual).toStrictEqual(expected)
  })

  test('should return query with non default min max', () => {
    const priceRange = { min: 0, max: 100 }
    const filters = { colors: [], tags: [], priceRange: { min: 10, max: 90 } }
    const actual = filtersToQuery(filters, priceRange)
    const expected = { [QueryParams.Min]: 10, [QueryParams.Max]: 90 }
    expect(actual).toStrictEqual(expected)
  })

  test('should return query for full filters', () => {
    const priceRange = { min: 0, max: 100 }
    const filters = {
      colors: ['black', 'white'],
      tags: ['black', 'white'],
      priceRange: { min: 10, max: 90 }
    }
    const actual = filtersToQuery(filters, priceRange)
    const expected = {
      [QueryParams.Color]: ['black', 'white'],
      [QueryParams.Tag]: ['black', 'white'],
      [QueryParams.Min]: 10,
      [QueryParams.Max]: 90
    }
    expect(actual).toStrictEqual(expected)
  })
})

describe('cropString', () => {
  test('should trim the string', () => {
    const actual = cropString('  string  ')
    const expected = 'string'
    expect(actual).toStrictEqual(expected)
  })

  test('should lowercase the string', () => {
    const actual = cropString('StRiNg')
    const expected = 'string'
    expect(actual).toStrictEqual(expected)
  })

  test('should remove # from the string', () => {
    const actual = cropString(' # StRiNg  ')
    const expected = 'string'
    expect(actual).toStrictEqual(expected)
  })
})

describe('getFilteredList', () => {

  const firstItem: ProductNode = {
    "node": {
      "name": "Nikki Lime Leather Sandals",
      "node_locale": "en",
      "thumbnailImage": {
        "file": {
          "url": "//images.ctfassets.net/bjhrajhd7nqm/5vl0dwakREcYWdzVGyhVxT/2f1bb7a0ae042011a1ffff3d8f1aff59/miista-nikki-lime-mules-6.jpg"
        }
      },
      "colorFamily": [
        {
          "name": "Green"
        }
      ],
      "categoryTags": ["Sandals", "Mid-Heels", "New Arrivals"],
      "shopifyProductEu": {
        "variants": {
          "edges": [
            {
              "node": {
                "price": "10.00"
              }
            }
          ]
        }
      }
    }
  }

  const secondItem: ProductNode = {
    "node": {
      "name": "Karolina Scotland Road White Leather Mules",
      "node_locale": "en",
      "thumbnailImage": {
        "file": {
          "url": "//images.ctfassets.net/bjhrajhd7nqm/7GnX1jOx04Ub383nbCFlw/6bddc627eda7598ebfbdce7aa84ee7a1/miista-karolina-scotland-white-mules-6.jpg"
        }
      },
      "colorFamily": [
        {
          "name": "White"
        }
      ],
      "categoryTags": ["Mules", "Mid-Heels", "New Arrivals"],
      "shopifyProductEu": {
        "variants": {
          "edges": [
            {
              "node": {
                "price": "25.00"
              }
            }
          ]
        }
      }
    }
  }

  const thirdItem: ProductNode = {
    "node": {
      "name": "Erica Chenywood Woven Leather Mules",
      "node_locale": "en",
      "thumbnailImage": {
        "file": {
          "url": "//images.ctfassets.net/bjhrajhd7nqm/R88POwT8EBbw0ID9QtOBi/4aaa47790b17c0376455c39240333606/miista-erica-chennywood-mules-5.jpg"
        }
      },
      "colorFamily": [
        {
          "name": "Brown"
        }
      ],
      "categoryTags": ["Mules", "Flats", "New Arrivals"],
      "shopifyProductEu": {
        "variants": {
          "edges": [
            {
              "node": {
                "price": "55.50"
              }
            }
          ]
        }
      }
    }
  }

  const fourthItem: ProductNode = {
    "node": {
      "name": "Ellie Crab Leather Sandals",
      "node_locale": "en",
      "thumbnailImage": {
        "file": {
          "url": "//images.ctfassets.net/bjhrajhd7nqm/7v3y4KEAYYmc04i7TaeSFI/800dab11143f940768ae41c69e1079a4/miista-ellie-crab-mules-6.jpg"
        }
      },
      "colorFamily": [
        {
          "name": "White"
        }
      ],
      "categoryTags": ["Sandals", "Mid-Heels", "New Arrivals"],
      "shopifyProductEu": {
        "variants": {
          "edges": [
            {
              "node": {
                "price": "100.00"
              }
            }
          ]
        }
      }
    }
  }

  const edges = [firstItem, secondItem, thirdItem, fourthItem]
  const priceRange = { min: 10, max: 100 }

  test('should return whole list', () => {
    const filters = { colors: [], tags: [], priceRange }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = [...edges]
    expect(actual).toStrictEqual(expected)
  })

  test('should return list for one color', () => {
    const filters = { colors: ['white'], tags: [], priceRange }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = [secondItem, fourthItem]
    expect(actual).toStrictEqual(expected)
  })

  test('should return list for few colors', () => {
    const filters = { colors: ['green', 'white'], tags: [], priceRange }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = [firstItem, secondItem, fourthItem]
    expect(actual).toStrictEqual(expected)
  })

  test('should return list for one tag', () => {
    const filters = { colors: [], tags: ['mid-heels'], priceRange }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = [firstItem, secondItem, fourthItem]
    expect(actual).toStrictEqual(expected)
  })

  test('should return list for few tags', () => {
    const filters = { colors: [], tags: ['mid-heels', 'mules'], priceRange }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = [...edges]
    expect(actual).toStrictEqual(expected)
  })

  test('should return list for low price', () => {
    const filters = { colors: [], tags: [], priceRange: { min: 10, max: 55 } }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = [firstItem, secondItem]
    expect(actual).toStrictEqual(expected)
  })

  test('should return list for high price', () => {
    const filters = { colors: [], tags: [], priceRange: { min: 56, max: 100 } }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = [fourthItem]
    expect(actual).toStrictEqual(expected)
  })

  test('should return list for few colors, tag and custom price range', () => {
    const filters = { colors: ['white', 'green'], tags: ['mid-heels'], priceRange: { min: 11, max: 99 } }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = [secondItem]
    expect(actual).toStrictEqual(expected)
  })

  test('should return empty list', () => {
    const filters = { colors: [], tags: [], priceRange: { min: 11, max: 12 } }
    const actual = getFilteredList(edges, filters, priceRange)
    const expected = []
    expect(actual).toStrictEqual(expected)
  })
})