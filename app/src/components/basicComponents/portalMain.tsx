import React from 'react'

import Box from '@mui/material/Box'

import Footer from 'PORTAL/components/footer'

interface Props {
  children: React.ReactNode
  bgcolor?: string
}

const PortalMain = ({ children, bgcolor = 'common.inputBackground' }: Props) => {

  return (
    <>
      <Box
        component='main'
        sx={{
          bgcolor,
          flex: 1,
          width: '100%',
          p: 3,
        }}
      >
        {children}
      </Box>
      <Footer sx={{ bgcolor }} />
    </>
  )
}

export default PortalMain
