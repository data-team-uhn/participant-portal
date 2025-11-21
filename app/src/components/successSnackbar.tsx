import React from 'react'

import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const SuccessSnackbar = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={!!open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ width: { xs: '80%', md: 'fit-content' } }}
    >
      <Alert
        onClose={onClose}
        severity='success'
        variant='filled'
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default SuccessSnackbar
