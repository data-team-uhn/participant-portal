import Alert from '@mui/material/Alert'
import { useEffect } from 'react'
import React from 'react'
import type { SxProps } from '@mui/material'

interface Props {
  id: string
  error: string
  onClose: () => void
  sx?: SxProps
}

const FormError = ({ id, error, onClose, sx = {} }: Props) => {
  /**
   * Scroll into focus when the error is present
   */
  useEffect(() => {
    if (!!error) {
      document.getElementById(id)?.focus()
    }
  }, [error])

  return (
    <Alert
      id={id}
      severity='error'
      tabIndex={0}
      aria-hidden={!error}
      sx={{
        position: 'relative',
        mt: -9,
        maxHeight: '86px',
        overflowY: 'auto',
        alignItems: 'center',
        visibility: !!error ? 'visible' : 'hidden',
        ...sx
      }}
      onClose={onClose}
    >
      {error}
    </Alert>
  )
}

export default FormError
