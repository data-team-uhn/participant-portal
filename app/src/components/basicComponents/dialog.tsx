import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { default as MUIDialog, DialogProps } from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'

import isOnMobile from 'PORTAL/hooks/isOnMobile'

interface Props extends DialogProps {
}

const Dialog = ({ children, ...rest }: Props) => {
  const onMobile = isOnMobile()

  return (
    <MUIDialog
      fullWidth
      fullScreen={onMobile}
      maxWidth={onMobile ? 'sm' : 'md'}
      {...rest}
    >
      <IconButton
        aria-label='close'
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => rest.onClose(e, 'escapeKeyDown')}
        sx={{
          position: 'absolute',
          top: '0.25rem',
          right: '0.25rem',
          color: 'black',
          fontWeight: 'bold',
        }}
      >
        <CloseIcon />
      </IconButton>
      {children}
    </MUIDialog>
  )
}

export default Dialog
