import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import Button from 'PORTAL/components/basicComponents/button'
import Typography from 'PORTAL/components/basicComponents/typography'
import ChangeEmailForm from 'PORTAL/components/changeEmailForm'
import ErrorSnackbar from 'PORTAL/components/errorSnackbar'
import SuccessSnackbar from 'PORTAL/components/successSnackbar'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

const VerificationFailed = () => {
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const navigate = useNavigate()
  const [params] = useSearchParams()

  const SUCCESS_MESSAGE = translateString('verify.resendLinkSuccess', 'Verification link has been resent successfully.')
  const ERROR_MESSAGE = translateString('verify.errors.resendLinkFailed', 'Something went wrong while trying to resend the verification link. Please try again later.')

  const email = params.get('email')
  const token = params.get('token')

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
        value: { email }
      })
      handleSuccess(SUCCESS_MESSAGE)
    } catch (err) {
      handleError(ERROR_MESSAGE)
    }
  }

  return (
    <>
      <ErrorSnackbar open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
      <SuccessSnackbar open={successOpen} onClose={() => setSuccessMessage(successMessage)} message={successMessage} />
      <Typography
        messageId='verify.linkExpired'
        defaultMessage='Your link has expired'
        id='confirmation-failed'
        component='h1'
        variant='h5'
        sx={{ mb: 3 }}
      />
      <Typography
        messageId='verify.linkExpiredText'
        defaultMessage='The link we sent to verify your account has expired. Please try again and be sure to click the new link within 30 minutes'
        sx={{ mb: 4 }}
      />
      <Button
        fullWidth
        labelId='verify.resendLink'
        defaultLabel='Resend Verification Link'
        disabled={buttonsDisabled}
        variant='contained'
        onClick={handleResendLink}
      />
      <ChangeEmailForm
        onSuccess={handleSuccess}
        onError={handleError}
        currentEmail={email}
        password={token}
        passwordField='VerifyToken'
        isDisabled={buttonsDisabled}
      />
      <Button
        labelId='verify.continueToLogin'
        defaultLabel='Continue to login'
        variant='outlinedGreyscale'
        onClick={() => navigate('/login')}
        sx={{
          width: '80%',
          mt: { xs: 'auto', md: 0 },
          mx: 'auto'
        }}
      />
    </>
  )
}

export default VerificationFailed
