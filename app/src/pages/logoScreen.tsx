import Box from '@mui/material/Box'
import React from 'react'
import { Outlet } from 'react-router-dom'

import Footer from 'PORTAL/components/footer'
import Logo from 'PORTAL/components/logo'

const LogoScreen = () => {

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        maxWidth: '26.25rem',
        minWidth: '20rem',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: 3,
        pt: 8,
        pb: 3,
        m: 'auto',
        gap: 6
      }}
    >
      <Logo sx={{ width: '100%' }} />
      <Box
        component='main'
        sx={{
          flexGrow: { xs: 1, md: 0 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          width: '100%',
        }}
      >
        <Outlet />
      </Box>
      <Footer sx={{ px: 0, py: 0 }} />
    </Box>
  )
}

export default LogoScreen
