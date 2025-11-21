import React, { useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'

import Button from 'PORTAL/components/basicComponents/button'
import ForgotPasswordForm from 'PORTAL/components/forgotPassword/forgotPasswordForm'
import ForgotPasswordSuccess from 'PORTAL/components/forgotPassword/forgotPasswordSuccess'

export default function ForgotPassword() {
  const [page, setPage] = useState(0)
  const [snackbarState, setSnackbarState] = useReducer((prevState, data) => {
    return { ...prevState, ...data }
  }, { open: false, msg: '', error: false })

  const navigate = useNavigate()

  const handleCloseSnackbar = () => {
    setSnackbarState({ open: false, msg: '', error: false })
  }

  const handleSubmit = () => {
    setPage(prevPage => prevPage + 1)
  }

  return (
    <>
      <Snackbar
        open={snackbarState.open}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarState.error ? 'error' : 'success'}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {snackbarState.msg}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {page === 0 && <ForgotPasswordForm onSubmit={handleSubmit} setSnackbar={setSnackbarState} />}
        {page === 1 && <ForgotPasswordSuccess />}
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
    </>
  )
}
