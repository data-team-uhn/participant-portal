import React, { type ChangeEvent, useEffect, useState } from 'react'

import get from 'lodash/get'
import moment from 'moment/moment'

import TextField from 'PORTAL/components/basicComponents/textField'
import { SurveyComponentProps } from 'PORTAL/declarations'

const DatePicker = (props: SurveyComponentProps) => {
  const {
    component,
    responses,
    onResponse,
    disabled,
    isPrinting
  } = props

  const [error, setError] = useState('')

  // If the component is a datePicker and the min and max are set to 'today', set the default value to today
  useEffect(() => {
    if (component && component.type === 'datePicker' && component.max === 'today' && component.min === 'today') {
      const today = moment().format('YYYY-MM-DD')
      onResponse(component, { value: get(responses, `[${component.id}]`) || today })
    }
  }, [])

  const invalidFormatError = 'The date entered is not valid. The expected format is YYYY-MM-DD.'

  const getDate = (dateString: string) => {
    switch (dateString) {
      case undefined:
        return undefined
      case 'today':
        return moment().format('YYYY-MM-DD')
      // Can add more custom values (tomorrow, yesterday, etc) if needed
      default:
        return dateString
    }
  }

  const handleResponse = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target
    const value = target.value

    const date = moment(value)
    let isValidDate = target.checkValidity() && date.isValid()

    if (min) {
      isValidDate = isValidDate && date.isSameOrAfter(min, 'day')
    }

    if (max) {
      isValidDate = isValidDate && date.isSameOrBefore(max, 'day')
    }

    if (!isValidDate) {
      const error = `${invalidFormatError} ${component.errorMessage}`
      setError(error)
      onResponse(component, { value: undefined })
      return
    }

    onResponse(component, { value })
  }

  const min = getDate(get(component, 'min'))
  const max = getDate(get(component, 'max'))

  return (
    <>
      <TextField
        {...component.props}
        label={component.text || ''}
        required={component.isRequired}
        disabled={disabled || isPrinting || component.disabled}
        error={!!error}
        fullWidth
        id={component.id}
        onChange={handleResponse}
        value={get(responses, component.id, '')}
        sx={{ mt: 0, mx: 0, mb: 2 }}
        type='date'
        helperText={error}
        slotProps={{
          htmlInput: {
            min: min,
            max: max,
            pattern: '\\d{4}-\\d{2}-\\d{2}'
          }
        }}
      />
    </>
  )
}

export default DatePicker
