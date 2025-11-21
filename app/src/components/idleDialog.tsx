import React, { useContext, useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'

import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'

import Dialog from 'PORTAL/components/basicComponents/dialog'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import { AuthContext } from 'PORTAL/contexts/auth'

const IdleDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { isAuthed, logout } = useContext(AuthContext)

  const timeout = 30 * 60 * 1000 // 30 min
  const logoutTimeout = 2 * 60 * 1000 // 2 min

  const handleOnPrompt = () => {
    setDialogOpen(true)
  }

  const handleLogout = () => {
    setDialogOpen(false)
    reset()
    logout()
  }

  const {
    reset,
    pause,
    resume,
    getRemainingTime
  } = useIdleTimer({
    timeout,
    promptBeforeIdle: logoutTimeout,
    onPrompt: handleOnPrompt,
    onIdle: handleLogout
  })

  useEffect(() => {
    if (!isAuthed) {
      reset()
      pause()
    } else {
      resume()
    }
  })

  const handleCloseDialog = () => {
    setDialogOpen(false)
    reset()
  }

  return (
    <Dialog open={dialogOpen} onClose={handleCloseDialog}>
      <DialogTitle component='h1' variant='h6'>
        <FormattedMessage id='idleDialog.title' defaultMessage='Your session is about to timeout' />
      </DialogTitle>
      <DialogContent>
        <Typography>
          <FormattedMessage
            id='idleDialog.description'
            defaultMessage="You're being timed out due to inactivity. Please choose to stay logged in or log out, otherwise you will be logged out automatically."
          />
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          margin: 'auto'
        }}
      >
        <Button variant='outlined' size='large' onClick={() => {handleLogout()}}>
          <FormattedMessage
            id='idleDialog.logOut'
            defaultMessage='Log out'
          />
        </Button>
        <Button variant='contained' size='large' onClick={handleCloseDialog}>
          <FormattedMessage
            id='idleDialog.stayLoggedIn'
            defaultMessage='Stay logged in'
          />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default IdleDialog
