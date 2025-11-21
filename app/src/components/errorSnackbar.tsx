import React from 'react'

import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const ErrorSnackbar = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={!!open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ width: { xs: '80%', md: 'fit-content' } }}
    >
      <Alert
        onClose={onClose}
        severity='error'
        variant='filled'
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default ErrorSnackbar
