import React, { useContext, useState, type ReactElement } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import DescriptionIcon from '@mui/icons-material/Description'
import ArrowCircleRightRoundedIcon from '@mui/icons-material/ArrowCircleRightRounded'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import HomeFilledIcon from '@mui/icons-material/HomeFilled'
import MenuIcon from '@mui/icons-material/Menu'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'

import map from 'lodash/map'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import Logo from 'PORTAL/components/logo'
import { NAV_MIN_HEIGHT, RoleEnum } from 'PORTAL/constants'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import { useAdminControls } from 'PORTAL/contexts/useAdminControls'
import isOnMobile from 'PORTAL/hooks/isOnMobile'
import InvitationsIcon from 'PORTAL/images/invitations_icon'
import ProfilePersonIcon from 'PORTAL/images/profile_person_icon'


interface LinkType {
  id: string
  href: string
  subpageMatcher?: string
  icon: ReactElement
  text: ReactElement
  action: () => void
  isHidden?: boolean
}

export default function navDrawer() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { logout, user } = useContext(AuthContext) as AuthContextType
  const { bannerHeight } = useAdminControls()

  const onMobile = isOnMobile()
  const navigate = useNavigate()

  const drawerWidth = onMobile ? '100%' : '16rem'

  const dashboardLink = {
    id: 'Home',
    href: '/home',
    subpageMatcher: undefined,
    icon: <HomeFilledIcon />,
    text: <FormattedMessage id='nav.home' defaultMessage='Home' />,
    action: () => navigate('/home'),
    isHidden: user.role !== RoleEnum.PARTICIPANT
  }

  const consentsLink = {
    id: 'Consents',
    href: '/consents',
    subpageMatcher: undefined,
    icon: <AssignmentTurnedInIcon />,
    text: <FormattedMessage id='nav.consents' defaultMessage='My Consents' />,
    action: () => navigate('/consents'),
    isHidden: user.role !== RoleEnum.PARTICIPANT
  }

  const responsesLink = {
    id: 'Modules',
    href: '/responses',
    subpageMatcher: undefined,
    icon: <DescriptionIcon />,
    text: <FormattedMessage id='nav.modules' defaultMessage='My Responses' />,
    action: () => navigate('/responses'),
    isHidden: user.role !== RoleEnum.PARTICIPANT
  }

  const coordinatorsLink = {
    id: 'Coordinators',
    href: '/coordinators',
    subpageMatcher: undefined,
    icon: <PeopleIcon />,
    text: <FormattedMessage id='nav.coordinators' defaultMessage='Coordinators' />,
    action: () => navigate('/coordinators'),
    isHidden: user.role !== RoleEnum.ADMIN
  }

  const participantsLink = {
    id: 'Participants',
    href: '/participants',
    subpageMatcher: undefined,
    icon: <PersonIcon />,
    text: <FormattedMessage id='nav.participants' defaultMessage='Participants' />,
    action: () => navigate('/participants'),
    isHidden: user.role !== RoleEnum.ADMIN
  }

  const participantSettingsLink = {
    id: 'Settings',
    href: '/settings',
    icon: <SettingsIcon />,
    text: <FormattedMessage id='nav.settings' defaultMessage='Settings' />,
    action: () => navigate('/settings'),
    isHidden: user.role === RoleEnum.ADMIN
  }

  const adminSettingsLink = {
    id: 'Settings',
    href: '/admin-settings',
    icon: <SettingsIcon/>,
    text: <FormattedMessage id='nav.settings' defaultMessage='Settings'/>,
    isHidden: user.role !== RoleEnum.ADMIN,
    action: () => navigate('/admin-settings')
  }

  const invitationsLink = {
    id: 'Invitations',
    href: '/invitations',
    icon: <InvitationsIcon/>,
    text: <FormattedMessage id='nav.invitations' defaultMessage='Invitations'/>,
    isHidden: user.role === RoleEnum.PARTICIPANT,
    action: () => navigate('/invitations')
  }

  const responsesAdminLink = {
    id: 'Participant Data',
    href: '/participant-data',
    icon: <DescriptionIcon/>,
    text: <FormattedMessage id='nav.participantData' defaultMessage='Participant Data'/>,
    isHidden: user.role === RoleEnum.PARTICIPANT,
    action: () => navigate('/participant-data')
  }
  
  const logoutLink = {
    id: 'Logout',
    href: null,
    subpageMatcher: undefined,
    icon: <ArrowCircleRightRoundedIcon />,
    text: <FormattedMessage id='nav.logOut' defaultMessage='Log Out' />,
    action: logout
  }

  const navItems = {
    top: [
      invitationsLink,
      dashboardLink,
      consentsLink,
      responsesLink,
      coordinatorsLink,
      participantsLink,
      responsesAdminLink,
      adminSettingsLink,
    ],
    bottom: [
      participantSettingsLink,
      logoutLink
    ]
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(prev => !prev)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

  const handleButtonClick = (action: (() => void)) => {
    action()
    handleDrawerClose()
  }

  const isSelected = (href: null | string, subpageMatcher?: string) => {
    const pathname = window.location.pathname
    const isExactMatch = href && pathname === href
    const isIndirectMatch = !!(subpageMatcher && pathname.match(subpageMatcher))

    return isExactMatch || isIndirectMatch
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '400px', height: '100%' }}>
      <AppBar
        component='header'
        role='banner'
        position="fixed"
        color='primary'
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: '1px solid',
          borderColor: 'primary.light',
          top: `${bannerHeight}px`,
          width: '100%'
        }}
      >
        <Toolbar
          variant='dense'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100%',
            minHeight: `${NAV_MIN_HEIGHT}px`
          }}
        >
          <IconButton
            color='inherit'
            aria-label={drawerOpen ? 'close drawer' : 'open drawer'}
            edge='start'
            size='large'
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Link to='/home'>
            <Logo color='white' size='small' />
          </Link>
          {
            user && user.role !== RoleEnum.ADMIN &&
            <IconButton onClick={() => navigate('/settings')} sx={{ ml: 'auto' }} aria-label='account settings'>
              <Avatar
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  width: '2em',
                  height: '2em'
                }}
              >
                <ProfilePersonIcon />
              </Avatar>
            </IconButton>
          }
        </Toolbar>
      </AppBar>
      <Box
        component='nav'
        sx={{ width: { md: drawerWidth }, flexShrink: 0, display: 'flex' }}
        aria-label='site navigation'
      >
        <Drawer
          variant={onMobile ? 'temporary' : 'permanent'}
          open={drawerOpen}
          onClick={handleDrawerClose}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              pt: `${bannerHeight}px`,
              boxSizing: 'border-box',
              bgcolor: 'common.white'
            }
          }}
        >
          <Toolbar variant='dense' sx={{ height: `${NAV_MIN_HEIGHT}px` }} />
          <List sx={{ overflow: 'auto', flex: 1, py: 2 }}>
            {map(navItems.top, (item: LinkType) => {
              if (item.isHidden) {
                return null
              }

              return (
                <ListItem
                  key={`top-menu-${item.id}`}
                  disablePadding
                >
                  <ListItemButton
                    selected={isSelected(item.href, item.subpageMatcher)}
                    onClick={() => handleButtonClick(item.action)}
                    sx={{ gap: 2, px: 3, py: 1.5 }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 'unset' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText sx={{ m: 0 }}>
                      {item.text}
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
          <List sx={{ py: 2 }}>
            {map(navItems.bottom, (item: LinkType) => {
              if (item.isHidden) {
                return null
              }

              return (
                <ListItem
                  key={`bottom-menu-${item.id}`}
                  disablePadding
                >
                  <ListItemButton
                    selected={isSelected(item.href, item.subpageMatcher)}
                    onClick={() => handleButtonClick(item.action)}
                    sx={{ gap: 2, px: 3, py: 1.5 }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 'unset' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText sx={{ m: 0 }}>
                      {item.text}
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Drawer>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          minWidth: '20rem',
          height: '100%',
          overflow: 'none',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar variant='dense' sx={{ height: `${NAV_MIN_HEIGHT + bannerHeight}px` }} />
        <Outlet />
      </Box>
    </Box>
  )
}
