import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { map } from 'lodash'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import CloseIcon from '@mui/icons-material/Close'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import MenuIcon from '@mui/icons-material/Menu'
import Toolbar from '@mui/material/Toolbar'
import useScrollTrigger from '@mui/material/useScrollTrigger'

import Button from 'PORTAL/components/basicComponents/button'
import Typography from 'PORTAL/components/basicComponents/typography'
import Logo from 'PORTAL/components/logo'
import { LANDING_NAV_MIN_HEIGHT } from 'PORTAL/constants'
import { useInviteValidator } from 'PORTAL/contexts/useInviteValidator'
import { isMobile } from 'PORTAL/utils'

export default function LandingNav() {
  const { fetchingToken, tokenIsValid } = useInviteValidator()

  const invitationParams = window.location.search

  const isOnMobile = isMobile()
  const navigate = useNavigate()
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: LANDING_NAV_MIN_HEIGHT,
    // The app-box div controls the scroll area for the landing page
    target: typeof window !== 'undefined' ? document.querySelector('.app-box') || undefined : undefined
  })

  /**
   * This is from the MUI designs for an app bar with a responsive menu: https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu
   */

  const [drawerOpen, setDrawerOpen] = useState(false)

  const links = [
    {
      component:
        <Typography
          key='about'
          variant='button'
          component={Link}
          href='#about'
          sx={{ m: 2 }}
          color='white'
          messageId='landing.about'
          defaultMessage='About'
        />
    },
    {
      component:
        <Typography
          key='contact'
          variant='button'
          component={Link}
          href='#contact'
          sx={{ m: 2 }}
          color='white'
          messageId='landing.contact'
          defaultMessage='Contact'
        />
    },
    {
      component:
        <Button
          key='login'
          sx={{ m: 1 }}
          onClick={() => navigate(`login${invitationParams}`)}
          variant='outlined'
          color='secondary'
          labelId='login.logIn'
          defaultLabel='Log in'
        />
    },
    (!fetchingToken && tokenIsValid && {
      component:
        <Button
          key='signup'
          sx={{ m: 1 }}
          onClick={() => navigate(`register${invitationParams}`)}
          variant='contained'
          color='secondary'
          labelId='landing.joinNow'
          defaultLabel='Join now'
        />
    })
  ]

  return (
    <AppBar
      component='header'
      position='fixed'
      color={trigger ? 'primary' : 'transparent'}
      elevation={trigger ? 4 : 0}
      sx={{ width: '100%', height: `${LANDING_NAV_MIN_HEIGHT}px`, boxShadow: 'none' }}
    >
      <Container maxWidth='xl' sx={{ pl: { xs: 1, md: 5 }, pr: { xs: 2, md: 5 } }}>
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            maxWidth: '90rem',
            margin: 'auto',
            width: '100%'
          }}
        >
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none', color: 'white' } }}>
            <IconButton
              size='large'
              aria-label='Open navitation menu'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={() => setDrawerOpen(true)}
              color='inherit'
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              variant='temporary'
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              sx={{ display: { xs: 'block', md: 'none' } }}
              slotProps={{
                paper: {
                  sx: { width: '16rem' }
                }
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: 64,
                  color: 'white'
                }}
              >
                <IconButton onClick={() => navigate('/')}>
                  <Logo color='white' size='small' />
                </IconButton>
                <IconButton aria-label='close' color='inherit' onClick={() => setDrawerOpen(false)}>
                  <CloseIcon fontSize='small' />
                </IconButton>
              </Box>
              <Divider color='white' sx={{ opacity: 0.7 }} />
              <Box component='nav' sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {map(links, 'component')}
              </Box>
            </Drawer>
          </Box>
          <IconButton onClick={() => navigate('/')}>
            <Logo color='white' size={isOnMobile ? 'small' : 'large'} />
          </IconButton>
          <Box
            component='nav'
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'right',
              right: 0,
              gap: 2
            }}
          >
            {map(links, 'component')}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
