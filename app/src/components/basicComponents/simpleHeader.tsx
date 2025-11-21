import { SxProps } from '@mui/material'
import React, { type ReactNode } from 'react'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import Typography from 'PORTAL/components/basicComponents/typography'

interface Props {
  titleId: string
  title: string
  children?: ReactNode
  sx?: SxProps

  [p: string]: any
}

const SimpleHeader = ({ titleId, title, children, sx, ...rest }: Props) => {
  return (
    <Box sx={{ pt: 1, pb: 3, mx: 'auto', maxWidth: '60.625rem', ...sx }} {...rest}>
      <Typography variant='h4' component='h1' messageId={titleId} defaultMessage={title} />
      {children}
      <Divider sx={{ mt: 3 }} />
    </Box>
  )
}

export default SimpleHeader
