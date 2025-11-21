import React, { useContext, useState } from 'react'
import { useSearchParams } from 'react-router'

import Box from '@mui/material/Box'

import each from 'lodash/each'
import isEmpty from 'lodash/isEmpty'

import Button from 'PORTAL/components/basicComponents/button'
import Typography from 'PORTAL/components/basicComponents/typography'
import ErrorSnackbar from 'PORTAL/components/errorSnackbar'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import PasswordField from 'PORTAL/components/formFields/passwordField'
import { AuthContext } from 'PORTAL/contexts/auth'
import { isValidPassword, translateString } from 'PORTAL/utils'

interface FieldErrors {
  password?: string
  confirmPassword?: string
}

interface Props {
  onSubmit: () => void
}

const ResetPasswordForm = ({ onSubmit }: Props) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { resetPassword } = useContext(AuthContext)

  const [params] = useSearchParams()
  const token = params.get('token')

  const EMPTY_FIELD_ERROR = translateString('common.errors.emptyField', 'Don\'t forget to fill this out')
  const PASSWORD_MISMATCH_ERROR = translateString('login.passwordMismatch', 'Passwords must match.')
  const GENERIC_ERROR = translateString('resetPassword.resetFailed', 'Your password could not be reset at this time.')
  const INVALID_PASSWORD_ERROR = translateString('register.errors.invalidPassword', 'The password you have entered is invalid. Your password must be at least 8 characters long and contain at least one digit, one uppercase letter, and one lowercase letter.')
  const TOKEN_EXPIRED_ERROR = translateString('resetPassword.tokenExpired', 'Your reset link has expired.')
  const PASSWORD_REQUIREMENT = translateString('register.passwordRequirements', 'Use 8 or more characters with a mix of letters, numbers and symbols.')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitButtonDisabled(true)
    setErrorOpen(false)
    setErrorMessage('')
    setFieldErrors({})
    const errors: FieldErrors = {}

    each([
      [password, 'password'],
      [confirmPassword, 'confirmPassword']
    ], ([field, fieldName]) => {
      if (!field) {
        errors[fieldName] = EMPTY_FIELD_ERROR
      }
    })

    const passwordData = password.trim()
    const confirmPasswordData = confirmPassword.trim()

    if (passwordData && confirmPasswordData && passwordData !== confirmPasswordData) {
      errors.confirmPassword = PASSWORD_MISMATCH_ERROR
    }

    if (passwordData && !isValidPassword(passwordData)) {
      errors.password = PASSWORD_REQUIREMENT
    }

    if (!isEmpty(errors)) {
      setFieldErrors(errors)
      setIsSubmitButtonDisabled(false)
      return
    }

    return resetPassword(token, passwordData)
      .then(() => {
        onSubmit()
      })
      .catch((err) => {
        if (err.message === 'Invalid password') {
          setFieldErrors({ password: INVALID_PASSWORD_ERROR })
          return
        }

        if (err.message === 'Password reset token has expired.') {
          setErrorMessage(TOKEN_EXPIRED_ERROR)
          setErrorOpen(true)
          return
        }

        setErrorMessage(GENERIC_ERROR)
        setErrorOpen(true)
      })
      .finally(() => {
        setIsSubmitButtonDisabled(false)
      })
  }

  return (
    <>
      <ErrorSnackbar open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
      <Box
        component='form'
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby='password-reset-form'
      >
        <Typography
          id='password-reset-form'
          component='h1'
          variant='h5'
          sx={{ mb: 4 }}
        >
          <FormattedMessage
            id='resetPassword.resetPassword'
            defaultMessage='Reset Password'
          />
        </Typography >
        <PasswordField
          labelId='login.password'
          defaultLabel='Password'
          required
          fullWidth
          id='password-local'
          name='new-password'
          autoComplete='new-password'
          error={!!fieldErrors.password}
          helperText={fieldErrors.password || PASSWORD_REQUIREMENT}
          value={password}
          onChange={(e => {
            setPassword(e.target.value)
            setFieldErrors(prev => ({ ...prev, password: '' }))
          })}
        />
        <PasswordField
          labelId='login.confirmPassword'
          defaultLabel='Confirm Password'
          required
          fullWidth
          id='confirm-password-local'
          name='new-password-confirm'
          autoComplete='new-password-confirm'
          error={!!fieldErrors.confirmPassword}
          helperText={fieldErrors.confirmPassword || ' '}
          value={confirmPassword}
          onChange={(e => {
            setConfirmPassword(e.target.value)
            setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
          })}
        />
        <Button
          disabled={isSubmitButtonDisabled}
          variant='contained'
          size='large'
          type='submit'
          sx={{ display: 'block', mt: 3, mx: 'auto', width: '80%' }}
        >
          <FormattedMessage
            id='resetPassword.resetPassword'
            defaultMessage='Reset Password'
          />
        </Button >
      </Box >
    </>
  )
}

export default ResetPasswordForm
