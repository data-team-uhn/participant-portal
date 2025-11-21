import React from 'react'
import { Outlet } from 'react-router-dom'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import Footer from 'PORTAL/components/footer'
import logoColour from 'PORTAL/images/logo_colour.png'

const LogoPlainBackgroundContainer = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '320px',
        backgroundColor: theme => theme.lightBackground,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Paper
        component={'main'}
        elevation={1}
        sx={{
          flex: 1,
          maxWidth: '1000px',
          justifyContent: 'center',
          margin: 6,
          padding: 6,
          borderRadius: '20px'
        }}
      >
        <Box
          aria-label='logo and pcgl branding'
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            my: 3,
            maxWidth: '230px'
          }}
        >
          <Box component='img' src={logoColour} alt='PCGL logo in white' sx={{ height: '60px' }} />
          <Divider variant='fullWidth' orientation='vertical' flexItem aria-hidden='true' sx={{ mx: 0.5 }} />
          <Typography>
            <FormattedMessage id='common.pcgl' defaultMessage='PanCanadian Genome Library' />
          </Typography>
        </Box>

        <Outlet />
      </Paper>
      <Footer sx={{ color: 'text.primary' }} />
    </Box>
  )
}

export default LogoPlainBackgroundContainer
