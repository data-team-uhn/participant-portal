import React from 'react'

import type { SxProps } from '@mui/material'
import Alert from '@mui/material/Alert'

import FormattedMessage from 'PORTAL/components/formattedMessage'

interface Props {
  messageId: string,
  defaultMessage: string,
  sx?: SxProps
}

const Warning = ({ messageId, defaultMessage, sx }: Props) => {
  return (
    <Alert severity='warning' sx={sx}>
      <FormattedMessage
        id={messageId}
        defaultMessage={defaultMessage}
      />
    </Alert>
  )
}

export default Warning
