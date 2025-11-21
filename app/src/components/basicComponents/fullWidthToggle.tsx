import React from 'react'

import { SxProps } from '@mui/material'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

import FormattedMessage from 'PORTAL/components/formattedMessage'

interface Props {
  labelId: string
  defaultLabel: string
  checked: boolean
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  sx?: SxProps
}

const FullWidthToggle = ({ labelId, defaultLabel, checked, onChange, disabled = false, sx = {} }: Props) => {
  return (
    <FormControlLabel
      label={
        <FormattedMessage
          id={labelId}
          defaultMessage={defaultLabel}
        />
      }
      labelPlacement='start'
      control={
        <Switch
          disabled={disabled}
          checked={checked}
          onChange={onChange}
          slotProps={{
            input: {
              'aria-label': defaultLabel
            }
          }}
        />
      }
      sx={{
        mx: 0,
        mb: 2,
        justifyContent: 'space-between',
        width: '100%',
        ...sx
      }}
      slotProps={{
        typography: { sx: { touchAction: 'none', cursor: 'auto', fontWeight: 700 } }
      }}
    />
  )
}

export default FullWidthToggle
