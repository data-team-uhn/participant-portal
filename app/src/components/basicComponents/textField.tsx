import React from 'react'

import FormLabel from '@mui/material/FormLabel'
import { default as MUITextField } from '@mui/material/TextField'

import FormattedMessage from 'PORTAL/components/formattedMessage'

export interface Props {
  label?: React.ReactNode
  labelId?: string
  defaultLabel?: string
  skeletonHeight?: number
  variant?: 'outlined' | 'filled' | 'standard'
  [x: string]: any
}

const TextField = ({
  id,
  label,
  labelId,
  defaultLabel,
  skeletonHeight = 10,
  disabled = false,
  sx,
  variant = 'outlined',
  ...rest
}: Props) => {

  return (
    <>
      <FormLabel htmlFor={id} disabled={disabled}>
        {label || <FormattedMessage id={labelId} defaultMessage={defaultLabel} />}
      </FormLabel>
      <MUITextField
        id={id}
        sx={{ mb: 1, ...sx }}
        disabled={disabled}
        {...rest}
      />
    </>
  )
}

export default TextField
