import React, { useState } from 'react'

import Box from '@mui/material/Box'

import Button from 'PORTAL/components/basicComponents/button'
import TextField from 'PORTAL/components/basicComponents/textField'
import Typography from 'PORTAL/components/basicComponents/typography'
import app from 'PORTAL/feathers-client'
import { translateString, isEmail } from 'PORTAL/utils'

interface Props {
  onSuccess: (message: string) => void
  onError: (message: string) => void
  currentEmail: string
  password: string
  passwordField: 'Password' | 'VerifyToken'
  isDisabled?: boolean
}

interface FieldErrors {
  email?: string
}

const ChangeEmailForm = ({ onSuccess, onError, currentEmail, password, passwordField, isDisabled = false }: Props) => {
  const [newEmail, setNewEmail] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)

  const UPDATE_EMAIL_SUCCESS_MESSAGE = translateString('verify.updatedEmailSuccess', 'The email has been updated successfully and a new verification link was sent.')
  const GENERIC_ERROR = translateString(
    'verify.errors.genericError',
    'There was a problem updating the email address. Please try again later.'
  )
  const EMAIL_INVALID_ERROR = translateString(
    'register.errors.validEmail',
    'Please enter a valid email address'
  )

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmittingEmail(true)

    setErrors({})
    const trimmedEmail = newEmail.trim()

    if (!isEmail(trimmedEmail)) {
      setIsSubmittingEmail(false)
      setErrors({ email: EMAIL_INVALID_ERROR })
      return
    }

    return app.service('update-email').create({
      newEmail,
      currentEmail,
      [`current${passwordField}`]: password
    })
      .then(() => {
        onSuccess(UPDATE_EMAIL_SUCCESS_MESSAGE)
      })
      .catch((error: any) => {
        onError(GENERIC_ERROR)
      })
      .finally(() => {
        setIsSubmittingEmail(false)
      })
  }

  return (
    <Box
      component='form'
      noValidate
      onSubmit={handleFormSubmit}
      sx={{
        bgcolor: 'common.grey',
        borderRadius: 2,
        pt: 3,
        pb: 1,
        px: 4,
        my: 5
      }}
    >
      <Typography
        variant='h5'
        messageId='verify.incorrectEmail'
        defaultMessage='Incorrect email address?'
        sx={{ mb: 4 }}
      />
      <TextField
        required
        id='email'
        labelId='verify.enterEmail'
        defaultLabel='Enter the correct email to try again.'
        variant='outlined'
        fullWidth
        value={newEmail}
        autoComplete='username'
        onChange={e => setNewEmail(e.target.value)}
        error={!!errors.email}
        helperText={errors.email || ' '}
      />
      <Button
        fullWidth
        type='submit'
        variant='contained'
        labelId='verify.sendLink'
        defaultLabel='Send verification link'
        disabled={isDisabled || isSubmittingEmail}
        sx={{ display: 'block', width: '90%', mx: 'auto', mb: 1 }}
      />
    </Box>
  )
}

export default ChangeEmailForm
