import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'

import Button from 'PORTAL/components/basicComponents/button'
import ResetPasswordSuccess from 'PORTAL/components/resetPassword/resetPasswordSuccess'
import ResetPasswordForm from 'PORTAL/components/resetPassword/resetPasswordForm'

export default function ResetPassword() {
  const [page, setPage] = useState(0)

  const navigate = useNavigate()

  const handleSubmit = () => {
    setPage(prevPage => prevPage + 1)
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      >
      {page === 0 && <ResetPasswordForm onSubmit={handleSubmit} />}
      {page === 1 && <ResetPasswordSuccess />}
      <Button
        labelId='actions.returnToLogin'
        defaultLabel='Return to Login'
        variant='outlinedGreyscale'
        size='large'
        onClick={() => navigate('/login')}
        sx={{
          display: 'block',
          mt: { xs: 'auto', md: 4 },
          mx: 'auto',
          width: '80%'
        }}
      />
    </Box>
  )
}
