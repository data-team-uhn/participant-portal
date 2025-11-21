import React from 'react'
import QRCode from "react-qr-code"

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormattedMessage from 'PORTAL/components/formattedMessage'

import Dialog from 'PORTAL/components/basicComponents/dialog'

type QRCodeDialogProps = {
  open: boolean
  onClose: () => void
  url: string
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = (props: QRCodeDialogProps) => {
  const { open, onClose, url } = props

  return (
    <Dialog open={open} onClose={onClose} fullScreen maxWidth={false}>
      {/*Temporary text*/}
      <DialogTitle variant='h4' component='h2' sx={{ margin: 'auto' }}>
        Scan QR Code
      </DialogTitle>
      <DialogContent sx={{ margin: 'auto', py: 4}}>
        <QRCode value={url}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='contained'>
          <FormattedMessage id='actions.close' defaultMessage='Close'/>
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QRCodeDialog
