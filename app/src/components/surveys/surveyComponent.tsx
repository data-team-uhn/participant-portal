import React from 'react'

import Checkbox from 'PORTAL/components/surveyComponents/checkbox'
import DatePicker from 'PORTAL/components/surveyComponents/datePicker'
import Divider from 'PORTAL/components/surveyComponents/divider'
import ExpandableText from 'PORTAL/components/surveyComponents/expandableText'
import RadioQuestion from 'PORTAL/components/surveyComponents/radioQuestion'
import Text from 'PORTAL/components/surveyComponents/text'
import TextField from 'PORTAL/components/surveyComponents/textField'
import type { SurveyComponentProps } from 'PORTAL/declarations'

const SurveyComponent = (props: SurveyComponentProps) => {
  const { component } = props

  switch (component.type) {
    case 'checkbox':
      return <Checkbox {...props} />
    case 'datePicker':
      return <DatePicker {...props} />
    case 'hr':
      return <Divider {...props} />
    case 'expandableText':
      return <ExpandableText {...props} />
    case 'radiogroup':
      return <RadioQuestion {...props} />
    case 'textField':
      return <TextField {...props} />
    case 'text':
    default:
      return <Text {...props} />
  }
}

export default SurveyComponent
