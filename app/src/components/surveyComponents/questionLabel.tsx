import React from 'react'

import FormLabel from '@mui/material/FormLabel'

import { SurveyComponentProps } from 'PORTAL/declarations'

const QuestionLabel = (props: SurveyComponentProps) => {
  const {
    component,
    disabled,
    isPrinting,
  } = props

  let componentType
  switch (component.type) {
    case 'checkbox':
    case 'radiogroup':
      componentType = 'legend'
      break
    default:
      componentType = 'label'
  }

  console.log(component.id, component.type, componentType)
  return (
    <FormLabel
      required={false}
      htmlFor={component.id}
      disabled={disabled || isPrinting}
      component={componentType}
    >
      <span dangerouslySetInnerHTML={{ __html: component.text }} />
    </FormLabel>
  )
}

export default QuestionLabel
