import { useState } from 'react'
import { Formik, Form, Field } from "formik"
import InputRange, { Range } from 'react-input-range'
import 'react-input-range/lib/css/index.css'

export type FilterMap = {
  colors: string[]
  tags: string[]
  priceRange: Range
}

type Props = {
  colors: string[]
  tags: string[]
  priceLimits: Range
  onSubmit: (f: FilterMap) => void
}

const Filters = ({ colors, tags, priceLimits, onSubmit }: Props) => {
  const [priceRange, setPriceRange] = useState<Range>(priceLimits)
  const { min, max } = priceLimits

  return (
    <div>
      <Formik
        initialValues={{ colors: { Yellow: true }, tags: {} }}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit({
            colors: Object.keys(values.colors),
            tags: Object.keys(values.tags),
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
              <button type="submit" disabled={isSubmitting}>Submit</button>
            </Form>
          </>
        )}
      </Formik>
    </div>
  )
}

export default Filters