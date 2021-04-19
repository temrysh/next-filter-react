import { useState, useEffect } from 'react'
import { Formik, Form, Field } from "formik"
import InputRange, { Range } from 'react-input-range'
import 'react-input-range/lib/css/index.css'

export type FilterMap = {
  colors: string[]
  tags: string[]
  priceRange: Range
}

type Props = {
  filters: FilterMap
  initFilters: FilterMap
  onSubmit: (f: FilterMap) => void
}

const fieldReducer = (acc: { [key: string]: boolean }, field: string) => (acc[field] = true) && acc

const Filters = ({ filters, initFilters, onSubmit }: Props) => {
  const initialValues = {
    colors: initFilters.colors.reduce(fieldReducer, {}),
    tags: initFilters.tags.reduce(fieldReducer, {})
  }
  const { colors, tags, priceRange: { min, max } } = filters
  const [priceRange, setPriceRange] = useState<Range>(initFilters.priceRange)

  useEffect(() => {
    setPriceRange(initFilters.priceRange)
  }, [initFilters.priceRange.min, initFilters.priceRange.max])

  return (
    <div>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values, { setSubmitting }) => {
          onSubmit({
            colors: Object.keys(values.colors).filter(color => values.colors[color]),
            tags: Object.keys(values.tags).filter(tag => values.tags[tag]),
            priceRange
          })
          setSubmitting(false)
        }}
      >
        {({ isSubmitting }) => (
          <>
            <div>
              <span>Price range:</span>
              <InputRange
                minValue={min}
                maxValue={max}
                value={priceRange}
                onChange={range => setPriceRange(range as Range)} />
            </div>
            <Form>
              <div>
                <span>Colors:</span>
                {colors.map((color) => (
                  <div key={color}>
                    <Field
                      type="checkbox"
                      id={color}
                      name={`colors.${color}`}
                    />
                    <label htmlFor={color}>{color}</label>
                  </div>
                ))}
              </div>
              <div>
                <span>Tags:</span>
                {tags.map((tag) => (
                  <div key={tag}>
                    <Field
                      type="checkbox"
                      id={tag}
                      name={`tags.${tag}`}
                    />
                    <label htmlFor={tag}>{tag}</label>
                  </div>
                ))}
              </div>
              <button type="submit" disabled={isSubmitting}>Apply</button>
            </Form>
          </>
        )}
      </Formik>
    </div>
  )
}

export default Filters