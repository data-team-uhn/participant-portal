import React from 'react'

import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

import Button from 'PORTAL/components/basicComponents/button'
import Dialog from 'PORTAL/components/basicComponents/dialog'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import Typography from 'PORTAL/components/basicComponents/typography'

type ConfirmationDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  body: React.JSX.Element
  onContinue: () => void
  continueText?: string
  continueColor?: 'primary' | 'error'
  cancelText?: string
  disabledButtons?: boolean
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = (props: ConfirmationDialogProps) => {

  const { open, onClose, title, body, onContinue, continueText = null, continueColor = 'error', cancelText = null, disabledButtons = false } = props

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle component='div'>
        <Typography variant='h4' component='h2'>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {body}
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant='outlinedGreyscale' disabled={disabledButtons} sx={{ mb: 0 }}>
          {cancelText ? cancelText : <FormattedMessage id='actions.cancel' defaultMessage='Cancel' />}
        </Button>
        <Button onClick={onContinue} variant='contained' color={continueColor} disabled={disabledButtons} sx={{ mb: 0 }}>
          {continueText ? continueText : <FormattedMessage id='actions.continue' defaultMessage='Continue' />}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
