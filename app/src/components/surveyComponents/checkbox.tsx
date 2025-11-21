import React from 'react'

import { default as MuiCheckbox } from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'

import get from 'lodash/get'

import Typography from 'PORTAL/components/basicComponents/typography'
import type { SurveyComponentProps } from 'PORTAL/declarations'

const Checkbox = (props: SurveyComponentProps) => {
  const { component, responses, onResponse, disabled, isPrinting } = props

  return (
    <FormControl
      required={component.isRequired}
      style={{ width: '100%' }}
      disabled={disabled || isPrinting}>
      <FormControlLabel
        required={false}
        control={
          <MuiCheckbox
            id={component.id}
            name={component.id}
            required={component.isRequired}
            color={disabled || isPrinting ? 'secondary' : 'primary'}
            checked={get(responses, `[${component.id}]`, false)}
            onChange={e => onResponse(component, e.target)}
            sx={{ marginBottom: 'auto', py: 0, px: 1 }}
          />
        }
        label={
          <Typography
            component='span'
            dangerouslySetInnerHTML={{ __html: component.text }}
            color={disabled || isPrinting ? 'textSecondary' : 'textPrimary'}
          />
        }
        sx={{ py: 2 }}
      />
    </FormControl>
  )
}

export default Checkbox
