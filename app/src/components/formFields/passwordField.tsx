import React, { useState } from 'react'

import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'

import TextField, { type Props as TextFieldProps } from 'PORTAL/components/basicComponents/textField'

const PasswordField = (props: TextFieldProps) => {
  const {
    error,
    slotProps,
    ...rest
  } = props

  const [showPassword, setShowPassword] = useState(false)

  return (
    <TextField
      error={!!error}
      helperText={error}
      type={showPassword ? 'text' : 'password'}
      slotProps={{
        ...slotProps,
        input: {
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={showPassword ? 'hide password' : 'show password'}
                size="large">
                {showPassword ? <VisibilityOutlinedIcon/> : <VisibilityOffOutlinedIcon/>}
              </IconButton>
            </InputAdornment>
          )
        }
      }}
      {...rest}
    />
  )
}

export default PasswordField
