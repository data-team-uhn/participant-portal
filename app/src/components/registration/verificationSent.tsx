import React, { useState } from 'react'

import Button from 'PORTAL/components/basicComponents/button'
import Typography from 'PORTAL/components/basicComponents/typography'
import ChangeEmailForm from 'PORTAL/components/changeEmailForm'
import ErrorSnackbar from 'PORTAL/components/errorSnackbar'
import type { RegistrationData } from 'PORTAL/components/registration/registrationForm'
import SuccessSnackbar from 'PORTAL/components/successSnackbar'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

interface Props {
  data: RegistrationData
}

const VerificationSent = ({ data }: Props) => {
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const SUCCESS_MESSAGE = translateString('verify.resendLinkSuccess', 'Verification link has been resent successfully.')
  const ERROR_MESSAGE = translateString('verify.errors.resendLinkFailed', 'Something went wrong while trying to resend the verification link. Please try again later.')

  const handleError = (message: string) => {
    setErrorMessage(message)
    setErrorOpen(true)
  }

  const handleSuccess = (message: string) => {
    setSuccessMessage(message)
    setSuccessOpen(true)
    setButtonsDisabled(true)
  }

  const handleResendLink = async () => {
    setButtonsDisabled(true)

    try {
      await app.service('authManagement').create({
        action: 'resendVerifySignup',
        value: { email: data.email }
      })
      handleSuccess(SUCCESS_MESSAGE)
    } catch (err) {
      handleError(ERROR_MESSAGE)
    } finally {
      setButtonsDisabled(false)
    }
  }

  return (
    <>
      <ErrorSnackbar open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
      <SuccessSnackbar open={successOpen} onClose={() => setSuccessMessage(successMessage)} message={successMessage} />
      <Typography
        messageId='register.checkEmail'
        defaultMessage='Check your email!'
        component='h1'
        variant='h5'
        sx={{ mb: 3 }}
      />
      <Typography
        messageId='register.emailSent'
        defaultMessage='We’ve sent an email to you at <1>{{email}}</1>. Tap on the link to verify your account.'
        values={{ email: data.email.trim() }}
        sx={{ mb: 4 }}
      >
        We’ve sent an email to you at <strong>{data.email.trim()}</strong>. Tap on the link to verify your account.
      </Typography>
      <Button
        fullWidth
        labelId='verify.resendLink'
        defaultLabel='Resend Verification Link'
        disabled={buttonsDisabled}
        variant='contained'
        onClick={handleResendLink}
        sx={{ width: '90%', mx: 'auto', mb: 1 }}
      />
      <ChangeEmailForm
        onSuccess={handleSuccess}
        onError={handleError}
        currentEmail={data.email}
        password={data.password}
        passwordField='Password'
        isDisabled={buttonsDisabled}
      />
    </>
  )
}

export default VerificationSent
