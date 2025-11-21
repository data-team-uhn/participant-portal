import { AuthContextType } from 'PORTAL/contexts/auth'
import { AuthContext } from 'PORTAL/contexts/auth'
import { useContext } from 'react'
import React from 'react'

import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

import FormattedMessage from 'PORTAL/components/formattedMessage'

export default () => {
  const { timedOut, setTimedOut } = useContext(AuthContext) as AuthContextType

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={timedOut}
      onClose={() => setTimedOut(false)}
    >
      <Alert
        severity='error'
        variant='filled'
        onClose={() => setTimedOut(false)}
        sx={{ width: '100%' }}
      >
        <FormattedMessage id='snackbar.timeout' defaultMessage='Unable to load page, refresh and try again.' />
      </Alert>
    </Snackbar>
  )
}
