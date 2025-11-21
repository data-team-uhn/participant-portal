import React, { useContext, useRef, useState } from 'react'
import Reaptcha from 'reaptcha'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'

import Button from 'PORTAL/components/basicComponents/button'
import TextField from 'PORTAL/components/basicComponents/textField'
import Typography from 'PORTAL/components/basicComponents/typography'
import { ADMIN_CONTACT, GOOGLE_CAPTCHA_ENABLED, REAPTCHA_PROPS } from 'PORTAL/constants'
import { AuthContext } from 'PORTAL/contexts/auth'
import { executeCaptcha, isEmail, translateString } from 'PORTAL/utils'

interface Props {
  setSnackbar: (state: { open: boolean; msg: string; error: boolean }) => void
  onSubmit: () => void
}

const ForgotPasswordForm = ({ setSnackbar, onSubmit }: Props) => {
  const { sendResetPassword } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false)

  const captchaRef = useRef(null)

  const EMAIL_INVALID_ERROR = translateString(
    'register.errors.validEmail',
    'Please enter a valid email address'
  )
  const GENERIC_ERROR = translateString(
    'forgotPassword.genericError',
    'There was a problem sending the reset link. Please try again later.'
  )

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isEmail(email)) {
      setError(EMAIL_INVALID_ERROR)
      setIsSubmitButtonDisabled(false)
      return
    }

    await executeCaptcha(captchaRef)
  }

  const handleResetPassword = (captcha_response: string) => {
    setError('')
    setIsSubmitButtonDisabled(true)

    return sendResetPassword(email, captcha_response)
      .then(() => {
        onSubmit()
      })
      .catch((err: any) => {
        const feathersError = err?.data?.errors?.[0]?.message || GENERIC_ERROR
        setSnackbar({ open: true, msg: feathersError, error: true })
      })
      .finally(() => {
        setIsSubmitButtonDisabled(false)
      })
  }

  return (
    <>
      <Typography
        messageId='forgotPassword.title'
        defaultMessage='Forgot your password?'
        component='h1'
        variant='h5'
        sx={{ mb: 3 }}
      />
      <Typography
        messageId='forgotPassword.instructions'
        defaultMessage={`Enter your email and we'll send you a link to reset your password.`}
        sx={{ mb: 2 }}
      />
      <Typography
        messageId='forgotPassword.noEmail'
        defaultMessage='If you have an account and you do not receive an email, please contact the admin at <1>{{email}}</1>.'
        values={{ email: ADMIN_CONTACT }}
      >
        If you have an account and you do not receive an email, please contact the admin at <Link
        href={`mailto:${ADMIN_CONTACT}`} target='_blank' rel='noopener noreferrer'>{email}</Link>.
      </Typography>
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
        <TextField
          required
          id='email'
          labelId='login.email'
          defaultLabel='Email'
          variant='outlined'
          fullWidth
          value={email}
          autoComplete='username'
          onChange={e => setEmail(e.target.value)}
          error={!!error}
          helperText={error || ' '}
        />

        {
          GOOGLE_CAPTCHA_ENABLED && (
            <Reaptcha
              ref={captchaRef}
              onVerify={captcha_response => handleResetPassword(captcha_response)}
              {...REAPTCHA_PROPS}
            />
          )
        }

        <Button
          fullWidth
          type='submit'
          variant='contained'
          labelId='forgotPassword.sendLink'
          defaultLabel='Send password reset link'
          disabled={isSubmitButtonDisabled}
        />
      </Box>
    </>
  )
}

export default ForgotPasswordForm
