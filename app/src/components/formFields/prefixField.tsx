import React from 'react'

import map from 'lodash/map'

import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import { translateString } from 'PORTAL/utils'

const PrefixField = ({ data, updateData, errors, updateErrors }) => {

  // Options
  const DR = translateString('user.prefixOptions.Dr', 'Dr.')
  const PROFESSOR = translateString('user.prefixOptions.Professor', 'Professor')
  const MR = translateString('user.prefixOptions.Mr', 'Mr.')
  const MRS = translateString('user.prefixOptions.Mrs', 'Mrs.')
  const MS = translateString('user.prefixOptions.Ms', 'Ms.')
  const MISS = translateString('user.prefixOptions.Miss', 'Miss.')
  const MX = translateString('user.prefixOptions.Mx', 'Mx.')

  const options = [
    '',
    DR,
    PROFESSOR,
    MR,
    MRS,
    MS,
    MISS,
    MX
  ]

  return (
    <>
      <FormLabel htmlFor='name-prefix'>
        <FormattedMessage id='register.prefix' defaultMessage='Prefix' />
      </FormLabel>
      <TextField
        select
        id='name-prefix'
        name='name-prefix'
        autoComplete='honorific-prefix'
        error={!!errors.name_prefix}
        helperText={errors.name_prefix || ' '}
        value={data.name_prefix}
        onChange={(e => {
          updateData({ name_prefix: e.target.value })
          updateErrors(prev => ({ ...prev, name_prefix: '' }))
        })}
        slotProps={{
          select: { native: true },
          inputLabel: { shrink: true }
        }}
      >
        {map(options, (prefix: string) => (
          <option key={`prefix-${prefix}`} value={prefix}>
            {prefix}
          </option>
        ))}
      </TextField>
    </>
  )
}

export default PrefixField
