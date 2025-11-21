import React, { type ReactNode } from 'react'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

import Typography from 'PORTAL/components/basicComponents/typography'

interface Props {
  img: any
  headerId: string
  headerMessage: string
  bodyId: string
  bodyMessage: string
  actions?: ReactNode
}

const EmptyCard = ({ img, headerId, headerMessage, bodyId, bodyMessage, actions }: Props) => {
  return (
    <Paper elevation={0} sx={{ p: 2, margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        component='img'
        src={img}
        alt=''
        sx={{
          boxSizing: 'content-box',
          height: '8.19rem',
          p: 3,
          mx: 'auto',
          mb: 3
        }}
      />
      <Typography
        component='h1'
        variant='h5'
        messageId={headerId}
        defaultMessage={headerMessage}
        sx={{ mb: 3, textAlign: 'center' }}
      />
      <Typography
        messageId={bodyId}
        defaultMessage={bodyMessage}
        sx={{ mb: 3 }}
      />
      {actions}
    </Paper>
  )
}

export default EmptyCard
