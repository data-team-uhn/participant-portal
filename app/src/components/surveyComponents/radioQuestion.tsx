import React, { ChangeEvent } from 'react'

import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'

import get from 'lodash/get'
import map from 'lodash/map'

import QuestionLabel from 'PORTAL/components/surveyComponents/questionLabel'
import type { SurveyComponentProps } from 'PORTAL/declarations'

const RadioQuestion = (props: SurveyComponentProps) => {
  const {
    component,
    responses,
    onResponse,
    disabled,
    isPrinting
  } = props

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onResponse(component, e.target)
  }

  return (
    <FormControl
      required={component.isRequired}
      component='fieldset'
      sx={{ width: '100%', mb: 2 }}
      disabled={disabled || isPrinting}
    >
      {component.text && <QuestionLabel {...props} />}
      <RadioGroup
        id={component.id}
        name={component.id}
        aria-required={component.isRequired}
        onChange={handleChange}
        value={get(responses, component.id, '')}
        style={{
          alignItems: 'left'
        }}
      >
        {map(component.choices, (choice, idx) => {
          return (
            <FormControlLabel
              key={`radio-option-${idx}`}
              value={choice.value}
              control={<Radio />}
              label={<span dangerouslySetInnerHTML={{ __html: choice.text || choice.value }} />}
            />
          )
        })}
      </RadioGroup>
    </FormControl>
  )
}

export default RadioQuestion
