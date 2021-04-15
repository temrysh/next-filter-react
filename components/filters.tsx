import { Formik, Form, Field } from "formik"

type Props = {
  colors: string[]
}

const Filters = ({ colors }: Props) => (
  <div>
    <Formik
      initialValues={{ colors: { Yellow: true } }}
      onSubmit={(values, { setSubmitting }) => {
        console.log(JSON.stringify(values, null, 2))
        setSubmitting(false)
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <Form>
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
          <button type="submit" disabled={isSubmitting}>
            Submit
        </button>
        </Form>
      )}
    </Formik>
  </div>
)

export default Filters