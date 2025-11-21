import React from 'react'

import Typography from 'PORTAL/components/basicComponents/typography'

const ResetPasswordSuccess = () => {
  return (
    <>
      <Typography
        messageId='resetPassword.success'
        defaultMessage='Success'
        variant='h4'
        component='h1'
        sx={{ mb: 4 }}
      />
      <Typography
        messageId='resetPassword.successMessage'
        defaultMessage='Your password has been reset succesfully.'
        sx={{ mb: 2 }}
      />
      <Typography
        messageId='resetPassword.returnToLogin'
        defaultMessage='Click the link below to return to the login page and log in with your new password'
        sx={{ mb: 2 }}
      />
    </>
  )
}

export default ResetPasswordSuccess
