import React from 'react'
import { useSearchParams, useNavigate } from 'react-router'

import Typography from 'PORTAL/components/basicComponents/typography'
import Button from 'PORTAL/components/basicComponents/button'

const VerificationSuccess = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const email = params.get('email')

  return (
    <>
      <Typography
        messageId='verify.emailVerified'
        defaultMessage='Email Verified'
        component='h1'
        variant='h5'
        sx={{ mb: 3 }}
      />
      <Typography
        messageId='verify.thankYou'
        defaultMessage='Thank you! Your email <1>{email}</1> has been verified.'
        sx={{ mb: 2 }}
      >
        Thank you! Your email <strong>{{ email } as any}</strong> has been verified.
      </Typography>
      <Typography
        messageId='verify.clickContinue'
        defaultMessage="Please continue to set up your account. You're almost there!"
        sx={{ mb: 3 }}
      />
      <Button
        labelId='verify.continueToLogin'
        defaultLabel='Continue to login'
        variant='contained'
        onClick={() => navigate('/login')}
        sx={{
          width: '80%',
          mt: { xs: 'auto', md: 4 },
          mx: 'auto'
        }}
      />
    </>
  )
}

export default VerificationSuccess
