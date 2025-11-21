import React, { useState, useRef } from 'react'
import Reaptcha from 'reaptcha'
import { useParams } from 'react-router-dom'

import forEach from 'lodash/forEach'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

import Box from '@mui/material/Box'

import ErrorSnackbar from 'PORTAL/components/errorSnackbar'
import TextField from 'PORTAL/components/basicComponents/textField'
import Typography from 'PORTAL/components/basicComponents/typography'
import PasswordField from 'PORTAL/components/formFields/passwordField'
import { GOOGLE_CAPTCHA_ENABLED, REAPTCHA_PROPS } from 'PORTAL/constants'
import { useInviteValidator } from 'PORTAL/contexts/useInviteValidator'
import app from 'PORTAL/feathers-client'
import { executeCaptcha, isEmail, isValidPassword, translateString } from 'PORTAL/utils'

export interface RegistrationData {
  email: string
  password: string
  confirmPassword?: string
}

interface Props {
  data: RegistrationData
  updateData: (x: Partial<RegistrationData>) => void
  formId: string
  setIsSubmitButtonDisabled: (x: boolean) => void
  onSubmit: () => void
}

interface fieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
  error?: string
}

const RegistrationForm = ({
  data,
  updateData,
  formId,
  setIsSubmitButtonDisabled,
  onSubmit
}: Props) => {
  const [fieldErrors, setFieldErrors] = useState<fieldErrors>({})

  const captchaRef = useRef(null)
  const { inviteToken: token, inviteRole: role } = useInviteValidator()
  const { studyLinkId } = useParams()

  const EMAIL_ERROR = translateString('register.errors.validEmail', 'Please enter a valid email address')
  const PASSWORD_REQUIREMENT = translateString('register.passwordRequirements', 'Use 8 or more characters with a mix of letters, numbers and symbols.')
  const REGISTRATION_ERROR = translateString('register.errors.general', 'Registration could not be completed. Please confirm that you entered your information correctly.')
  const REGISTRATION_FORBIDDEN = translateString('register.errors.forbidden', 'You have not been invited to register. Please confirm that you entered your email correctly.')
  const PASSWORD_MISMATCH_ERROR = translateString('login.passwordMismatch', 'Passwords must match.')

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitButtonDisabled(true)

    const errors: fieldErrors = {}

    const email = data.email.trim()
    const password = data.password.trim()
    const confirmPassword = data.confirmPassword.trim()

    if (!email || !isEmail(email)) {
      errors.email = EMAIL_ERROR
    }

    if (!password || !isValidPassword(password)) {
      errors.password = PASSWORD_REQUIREMENT
    }

    if (password && password !== confirmPassword) {
      errors.confirmPassword = PASSWORD_MISMATCH_ERROR
    }

    if (!isEmpty(errors)) {
      setFieldErrors(errors)
      setIsSubmitButtonDisabled(false)
      return
    }

    try {
      await executeCaptcha(captchaRef)
    } catch (error) {
      setFieldErrors({ error: REGISTRATION_ERROR })
      setIsSubmitButtonDisabled(false)
    }
  }

  const handleRegister = (captcha_response: string) => {
    const errors: fieldErrors = {}
    const email = data.email.trim()
    const password = data.password.trim()

    return app.service('registration').create({
      email,
      password,
      role,
      token,
      studyLinkId,
      captcha_response
    })
      .then(() => {
        setFieldErrors({})
        setIsSubmitButtonDisabled(false)
        onSubmit && onSubmit()
      })
      .catch((e: any) => {
        setIsSubmitButtonDisabled(false)

        if (e.code === 403) { // Forbidden
          setFieldErrors({ error: REGISTRATION_FORBIDDEN })
          return
        }

        const errorArray = get(e, 'errors')

        if (isEmpty(errorArray)) {
          setFieldErrors({ error: REGISTRATION_ERROR })
          return
        }

        forEach(errorArray, (error: any) => {
          errors[error.path] = error.message
        })

        setFieldErrors(errors)
      })
  }

  return (
    <Box id={formId} component='form' noValidate onSubmit={handleFormSubmit}>
      <Typography
        messageId='register.accountCreation'
        defaultMessage='Account Set Up'
        component='h1'
        variant='h5'
        sx={{ mb: 4 }}
      />
      <TextField
        required
        fullWidth
        id='email'
        labelId='login.email'
        defaultLabel='Email'
        autoComplete='email'
        error={!!fieldErrors.email}
        helperText={fieldErrors.email || ' '}
        value={data.email}
        onChange={(e => {
          updateData({ email: e.target.value })
          setFieldErrors(prev => ({ ...prev, email: '' }))
        })}
      />
      <PasswordField
        required
        fullWidth
        id='password-local'
        labelId='login.password'
        defaultLabel='Password'
        autoComplete='new-password'
        error={!!fieldErrors.password}
        helperText={fieldErrors.password || PASSWORD_REQUIREMENT}
        value={data.password}
        onChange={(e => {
          updateData({ password: e.target.value })
          setFieldErrors(prev => ({ ...prev, password: '' }))
        })}
      />
      <PasswordField
        required
        fullWidth
        id='confirm-password-local'
        labelId='login.confirmPassword'
        defaultLabel='Confirm Password'
        autoComplete='new-password-confirm'
        error={!!fieldErrors.confirmPassword}
        helperText={fieldErrors.confirmPassword || ' '}
        value={data.confirmPassword}
        onChange={(e => {
          updateData({ confirmPassword: e.target.value })
          setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
        })}
      />

      <ErrorSnackbar open={!!fieldErrors.error} message={fieldErrors.error} onClose={() => { setFieldErrors({ error: '' }) }} />

      {
        GOOGLE_CAPTCHA_ENABLED && (
          <Reaptcha
            ref={captchaRef}
            onVerify={captcha_response => handleRegister(captcha_response)}
            {...REAPTCHA_PROPS}
          />
        )
      }

    </Box>
  )
}

export default RegistrationForm
