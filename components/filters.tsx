import { useState, useEffect } from 'react'
import styled from '@emotion/styled'
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
  filterOptions: FilterMap
  onSubmit: (f: FilterMap) => void
}

const Container = styled.div`
  width: 300px;
  height: 100vh;
  overflow-y: scroll;
  float: left;
`

const SectionContainer = styled.div`
  margin: 20px;
  margin-bottom: 40px;
`

const SectionHeading = styled.span`
  font-size: 18px;
  display: block;
  margin-bottom: 20px;
`

const OptionContainer = styled.div`
  margin: 6px 0 6px 0;
`

const fieldReducer = (acc: { [key: string]: boolean }, field: string) => (acc[field] = true) && acc

const Filters = ({ filters, filterOptions, onSubmit }: Props) => {
  const initialValues = {
    colors: filters.colors.reduce(fieldReducer, {}),
    tags: filters.tags.reduce(fieldReducer, {})
  }
  const { colors, tags, priceRange: { min, max } } = filterOptions
  const [priceRange, setPriceRange] = useState<Range>(filterOptions.priceRange)

  useEffect(() => {
    setPriceRange(filters.priceRange)
  }, [filters.priceRange.min, filters.priceRange.max])

  return (
    <Container>
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
          <Form>
            <SectionContainer>
              <button type="submit" disabled={isSubmitting}>Apply</button>
            </SectionContainer>
            <SectionContainer>
              <SectionHeading>Price range:</SectionHeading>
              <InputRange
                minValue={min}
                maxValue={max}
                value={priceRange}
                onChange={range => setPriceRange(range as Range)} />
            </SectionContainer>
            <SectionContainer>
              <SectionHeading>Colors:</SectionHeading>
              {colors.map((color) => (
                <OptionContainer key={color}>
                  <Field
                    type="checkbox"
                    id={color}
                    name={`colors.${color}`}
                  />
                  <label htmlFor={color}>{color}</label>
                </OptionContainer>
              ))}
            </SectionContainer>
            <SectionContainer>
              <SectionHeading>Tags:</SectionHeading>
              {tags.map((tag) => (
                <OptionContainer key={tag}>
                  <Field
                    type="checkbox"
                    id={tag}
                    name={`tags.${tag}`}
                  />
                  <label htmlFor={tag}>{tag}</label>
                </OptionContainer>
              ))}
            </SectionContainer>
          </Form>
        )}
      </Formik>
    </Container>
  )
}

export default Filters