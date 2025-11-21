import React from 'react'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import { default as MUIButton } from '@mui/material/Button'
import type { ButtonProps } from '@mui/material'

interface Props extends ButtonProps {
  labelId?: string
  defaultLabel?: string
}

const Button = (props: Props) => {
  const { size = 'large', labelId, defaultLabel, sx, children, ...rest } = props

  if (labelId) {
    return (
      <MUIButton size={size} {...rest} sx={{ mb: 2, ...sx }}>
        <FormattedMessage
          id={labelId}
          defaultMessage={defaultLabel}
        />
      </MUIButton>
    )
  }

  return (
    <MUIButton size={size} {...rest} sx={{ mb: 2, ...sx }}>
      {children}
    </MUIButton>
  )
}

export default Button
