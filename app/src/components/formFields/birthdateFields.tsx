import React from 'react'
import map from 'lodash/map'
import range from 'lodash/range'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import { translateString } from 'PORTAL/utils'


const BirthdateFields = ({ data, updateData, errors, updateErrors }) => {
  const monthTranslated = translateString('register.month', 'Month')
  const dayTranslated = translateString('register.day', 'Day')
  const yearTranslated = translateString('register.year', 'Year')

  const days = range(1, 32)
  const years = range(1930, new Date().getFullYear() + 1)
  // TODO: Translate these
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  return (
    <Box sx={{ width: '100%', my: 1, textAlign: 'left' }}>
      <FormLabel component='legend'>
        <FormattedMessage id='register.dateOfBirth' defaultMessage='Date of Birth' />
      </FormLabel>
      <FormGroup row style={{ flexWrap: 'nowrap', width: '100%', display: 'flex' }}>
        <FormControl fullWidth required sx={{ mr: 2 }} error={!!errors.birthDate}>
          <TextField
            variant='outlined'
            select
            label={monthTranslated}
            id='birthdate-month'
            name='bday-month'
            autoComplete='bday-month'
            value={data.birthMonth}
            onChange={e => {
              updateData({ birthMonth: e.target.value })
              if (data.birthDay && e.target.value && data.birthYear) {
                updateErrors(prev => ({...prev, birthDate: ''}))
              }
            }}
            slotProps={{
              select: { native: true },
              inputLabel: { shrink: true }
            }}>
            <option value='' disabled></option>
            {map(months, (month: string, i: number) => (
              <option key={`month-${month}`} value={i + 1}>
                {month}
              </option>
            ))}
          </TextField>
        </FormControl>
        <FormControl fullWidth required sx={{ width: '50%', mr: 2 }} error={!!errors.birthDate}>
          <TextField
            variant='outlined'
            select
            label={dayTranslated}
            id='birthdate-day'
            name='bday-day'
            autoComplete='bday-day'
            value={data.birthDay}
            onChange={e => {
              updateData({ birthDay: e.target.value })
              if (e.target.value && data.birthMonth && data.birthYear) {
                updateErrors(prev => ({...prev, birthDate: ''}))
              }
            }}
            slotProps={{
              select: { native: true },
              inputLabel: { shrink: true }
            }}>
            <option value='' disabled></option>
            {map(days, (day: string) => (
              <option key={`day-${day}`} value={day}>
                {day}
              </option>
            ))}
          </TextField>
        </FormControl>
        <FormControl fullWidth required style={{ width: '75%' }} error={!!errors.birthDate}>
          <TextField
            variant='outlined'
            select
            label={yearTranslated}
            id='birthdate-year'
            name='bday-year'
            autoComplete='bday-year'
            value={data.birthYear}
            onChange={e => {
              updateData({ birthYear: e.target.value })
              if (data.birthDay && data.birthMonth && e.target.value) {
                updateErrors(prev => ({...prev, birthDate: ''}))
              }
            }}
            slotProps={{
              select: { native: true },
              inputLabel: { shrink: true }
            }}>
            <option value='' disabled></option>
            {map(years, (year: string) => (
              <option key={`year-${year}`} value={year}>
                {year}
              </option>
            ))}
          </TextField>
        </FormControl>
      </FormGroup>
      <FormHelperText error>
        {errors.birthDate || ' '}
      </FormHelperText>
    </Box>
  )
}

export default BirthdateFields
