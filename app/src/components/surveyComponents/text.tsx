import React from 'react'

import get from 'lodash/get'

import Typography from 'PORTAL/components/basicComponents/typography'
import { SurveyComponentProps } from 'PORTAL/declarations'

const Text = (props: SurveyComponentProps) => {
  const { component, disabled } = props

  const text = get(component, 'text', '')
  const { sx = {}, ...rest } = get(component, 'props', { sx: {} }) as Record<string, any>

  return (
    <Typography
      component={component.component ? component.component : 'p'}
      variant={component.variant ? component.variant : 'body1'}
      dangerouslySetInnerHTML={{ __html: text }}
      gutterBottom
      color={disabled ? 'textSecondary' : 'textPrimary'}
      {...rest}
      sx={sx}
    />
  )
}

export default Text
