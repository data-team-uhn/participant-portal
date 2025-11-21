import React from 'react'

import Box from '@mui/material/Box'

import connect_logo_white from 'PORTAL/images/connect_logo_placeholder_white.png'
import connect_logo_black from 'PORTAL/images/connect_logo_placeholder_black.png'
import connect_logo_color from 'PORTAL/images/connect_logo_placeholder_color.png'
import Typography from 'PORTAL/components/basicComponents/typography'
import type { SxProps } from '@mui/material'

interface Props {
  color?: 'black' | 'white' | 'color'
  sx?: SxProps
  size?: 'small' | 'large'
}

const Logo = ({ color = 'color', size = 'large', sx = {} }: Props) => {
  const fontSize = size === 'small' ? '1.175rem' : '1.625rem'
  const imgSize = size === 'small' ? '2.175rem' : '3rem'
  const img = color === 'black' ? connect_logo_black : color === 'white' ? connect_logo_white : connect_logo_color
  const fontColor = color === 'color' ? 'primary.main' : color

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <Box component='img' src={img} alt='Connect logo' sx={{ height: imgSize, mr: 1, color }} />
      <Typography component='span' color={fontColor} sx={{ fontSize }}><strong>C</strong>onnect</Typography>
    </Box>
  )
}

export default Logo
