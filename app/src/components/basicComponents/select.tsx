import React from 'react'

import { SxProps } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'

import InputLabel from '@mui/material/InputLabel'
import NativeSelect, { type NativeSelectProps } from '@mui/material/NativeSelect'

import FormattedMessage from 'PORTAL/components/formattedMessage'

interface Props extends NativeSelectProps {
  labelId?: string
  label?: string
  fullWidth?: boolean
  helperText?: string
  rootSx?: SxProps
}

/**
 * A native select component that handles translated labels.
 */
const Select = ({
  labelId,
  label,
  inputProps,
  fullWidth = false,
  helperText,
  error,
  rootSx = {},
  children,
  ...rest
}: Props) => {
  return (
    <FormControl fullWidth={fullWidth} sx={rootSx}>
      {label && (
        <InputLabel variant='standard' htmlFor={inputProps?.id}>
          <FormattedMessage id={labelId} defaultMessage={label} />
        </InputLabel>
      )}
      <NativeSelect
        inputProps={inputProps}
        error={error}
        {...rest}
      >
        {children}
      </NativeSelect>
      {
        helperText &&
        <FormHelperText error={error} aria-hidden={!helperText} margin='dense' sx={{ ml: 2 }}>
          {helperText || ' '}
        </FormHelperText>
      }
    </FormControl>
    
  )
}

export default Select
