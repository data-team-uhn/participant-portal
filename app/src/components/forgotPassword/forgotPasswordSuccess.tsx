import React from 'react'

import Typography from 'PORTAL/components/basicComponents/typography'

const ForgotPasswordSuccess = () => {
  return (
    <>
      <Typography
        messageId='forgotPassword.success'
        defaultMessage='Success'
        component='h1'
        variant='h5'
        sx={{ mb: 3 }}
      />
      <Typography
        messageId='forgotPassword.successMessage'
        defaultMessage='If you have entered a valid email address, a link to reset your password has been sent to your inbox. Please check your inbox and follow the instructions.'
        sx={{ mb: 2 }}
      />
      <Typography
        messageId='forgotPassword.returnToLogin'
        defaultMessage='Click the link below to return to the login page.'
        sx={{ mb: 2 }}
      />
    </>
  )
}

export default ForgotPasswordSuccess
