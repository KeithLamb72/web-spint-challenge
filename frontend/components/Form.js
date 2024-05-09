import React, { useEffect, useState } from 'react'
import axios from 'axios'
import * as yup from 'yup'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const schema = yup.object().shape({
  fullName: yup.string().min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong).required(),
  size: yup.string().oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect).required(),
  toppings: yup.array().of(yup.string().matches(/^[1-5]$/, 'Invalid topping ID')),
});
// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
  const [formValues, setFormValues] = useState({
    fullName: '',
    size: '',
    toppings: []
  })

  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [failureMessage, setFailureMessage] = useState('')
  const [disabled, setDisabled] = useState(true)

  const validate = (name, value) => {
    yup.reach(schema, name)
      .validate(value)
      .then(() => setFormErrors({ ...formErrors, [name]: ''}))
      .catch(err => setFormErrors ({  ...formErrors, [name]: err.errors[0] }))
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    if(type === 'checkbox') {
      const updatedToppings = checked ? [...formValues.toppings, value] : formValues.toppings.filter(t => t !== value)
      setFormValues({ ...formValues, toppings: updatedToppings})
      validate('toppings', updatedToppings)
    } else {
      setFormValues({ ...formValues, [name]: value })
      validate(name, value)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:9009/api/order', formValues)
      setSuccessMessage(res.data.message)
      setFailureMessage('')
      setFormValues({ fullName: '', size: '', toppings: [] }) // Clear form on success
    } catch (err) {
      setSuccessMessage('')
      setFailureMessage(err.response?.data?.message || 'Something went wrong.')
    }
  }

  useEffect(() => {
    schema.isValid(formValues).then(valid => setDisabled(!valid))
  }, [formValues])

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {successMessage && <div className='success'>{successMessage}</div>}
      {failureMessage && <div className='failure'>{failureMessage}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input
            placeholder="Type full name"
            id="fullName"
            name="fullName"
            type="text"
            value={formValues.fullName}
            onChange={handleChange}
          />
        </div>
        {formErrors.fullName && <div className='error'>{formErrors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select 
          id="size" 
          name="size" 
          value={formValues.size} 
          onChange={handleChange}
          >
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {formErrors.size && <div className='error'>{formErrors.size}</div>}
        </div>
      <div className="input-group">
        {toppings.map(t => (
          <label key={t.topping_id}>
            <input name="toppings" type="checkbox" value={t.topping_id} checked={formValues.toppings.includes(t.topping_id)} onChange={handleChange}/>
            {t.text}<br />
          </label>
        ))}
      </div>
      <input type="submit" disabled={disabled}/>
    </form>
  )
}
