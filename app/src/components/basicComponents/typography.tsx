import React from 'react'
import { type To } from 'react-router-dom'

import type { TypographyProps } from '@mui/material'
import { default as MUITypography } from '@mui/material/Typography'

import FormattedMessage from 'PORTAL/components/formattedMessage'

interface Props extends TypographyProps {
  messageId?: string
  defaultMessage?: string
  values?: object
  to?: To
  target?: string
  href?: string
  rel?: string
}

const Typography = (props: Props) => {
  const {
    messageId,
    defaultMessage,
    values = {},
    children = null,
    ...rest
  } = props

  if (messageId) {
    return (
      <MUITypography {...rest}>
        <FormattedMessage id={messageId} defaultMessage={defaultMessage} values={values}>
          {children}
        </FormattedMessage>
      </MUITypography>
    )
  }

  return (
    <MUITypography {...rest}>
      {children}
    </MUITypography>
  )
}

export default Typography
