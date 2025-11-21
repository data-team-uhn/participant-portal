import React, { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import Button from 'PORTAL/components/basicComponents/button'
import ConfirmationDialog from 'PORTAL/components/basicComponents/confirmationDialog'
import FullWidthToggle from 'PORTAL/components/basicComponents/fullWidthToggle'
import PortalMain from 'PORTAL/components/basicComponents/portalMain'
import SimpleHeader from 'PORTAL/components/basicComponents/simpleHeader'
import TextField from 'PORTAL/components/basicComponents/textField'
import Typography from 'PORTAL/components/basicComponents/typography'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import { DEFAULT_BANNER_MESSAGE } from 'PORTAL/constants'
import { useAdminControls } from 'PORTAL/contexts/useAdminControls'
import { translateString } from 'PORTAL/utils'

import type { FormEvent, ChangeEvent } from 'react'

const announcementMaxLength = 255

enum referrers {
  announcementMessage,
  bannerOn,
  restrict,
  resetAnnouncement,
  logout
}

const AdminSettings = () => {
  const [announcement, setAnnouncement] = useState('')
  const [bannerToggle, setBannerToggle] = useState(false)
  const [restrictLoginToggle, setRestrictLoginToggle] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [confirmationReferrer, setConfirmationReferrer] = useState(null)

  const {
    isMaintenanceBannerOn,
    setIsMaintenanceBannerOn,
    maintenanceBannerMessage,
    setMaintenanceBannerMessage,
    isLoginRestricted,
    restrictLogin,
    totalAuthenticatedUsers,
    totalUsersOnline,
    lastUpdateTime,
    lastAdminToUpdate,
    logoutAllUsers,
    sessionInfoLoading
  } = useAdminControls()

  useEffect(() => {
    if (maintenanceBannerMessage) {
      setAnnouncement(maintenanceBannerMessage)
    }
  }, [maintenanceBannerMessage])

  useEffect(() => {
    setBannerToggle(isMaintenanceBannerOn)
  }, [isMaintenanceBannerOn])

  useEffect(() => {
    setRestrictLoginToggle(isLoginRestricted)
  }, [isLoginRestricted])

  const CONFIRM_LOGOUT = translateString('settings.confirmLogout', 'Are you sure you want to logout all online users?')
  const CONFIRM_RESTRICT = translateString('settings.confirmRestrict', 'Are you sure you want to restrict all new logins to the application?')
  const CONFIRM_BANNER_MESSAGE = translateString('settings.confirmBannerMessage', 'Are you sure you want to update the banner message that is currently being displayed?')
  const CONFIRM_BANNER_ON = translateString('settings.confirmBannerOn', 'Are you sure you want to show an announcement banner for all users?')
  const CONFIRM_BANNER_RESET = translateString('settings.confirmBannerReset', 'By resetting to the default announcement the current announcement will be lost. Are you sure you want to reset?')

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
  }

  const handleConfirm = () => {
    handleConfirmationClose()

    switch (confirmationReferrer) {
      case (referrers.announcementMessage):
        return setMaintenanceBannerMessage(announcement)
      case (referrers.bannerOn):
        return setIsMaintenanceBannerOn(true)
      case (referrers.restrict):
        return restrictLogin(true)
      case (referrers.resetAnnouncement):
        return setMaintenanceBannerMessage(DEFAULT_BANNER_MESSAGE)
      case (referrers.logout):
        return logoutAllUsers()
    }
  }

  const handleLogoutAll = () => {
    setConfirmationReferrer(referrers.logout)
    setConfirmationMessage(CONFIRM_LOGOUT)
    setConfirmationOpen(true)
  }

  const handleToggleRestrict = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked

    // If turning off restricted logins, don't ask for confirmation
    if (!checked) {
      restrictLogin(checked)
      return
    }

    setConfirmationReferrer(referrers.restrict)
    setConfirmationMessage(CONFIRM_RESTRICT)
    setConfirmationOpen(true)
  }

  const handleBannerToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked

    // If turning off banner, don't ask for confirmation
    if (!checked) {
      setIsMaintenanceBannerOn(checked)
      return
    }

    setConfirmationReferrer(referrers.bannerOn)
    setConfirmationMessage(CONFIRM_BANNER_ON)
    setConfirmationOpen(true)
  }

  const handleSaveMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setConfirmationReferrer(referrers.announcementMessage)
    setConfirmationMessage(CONFIRM_BANNER_MESSAGE)
    setConfirmationOpen(true)
  }

  const handleMessageReset = () => {
    setConfirmationReferrer(referrers.resetAnnouncement)
    setConfirmationMessage(CONFIRM_BANNER_RESET)
    setConfirmationOpen(true)
  }

  return (
    <PortalMain>
      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onContinue={handleConfirm}
        continueColor='primary'
        title={translateString('settings.confirm', 'Confirm')}
        body={
          <Typography>
            {confirmationMessage}
          </Typography>
        }
        cancelText={translateString('actions.cancel', 'Cancel')}
        continueText={translateString('actions.save', 'Save')}
      />
      <SimpleHeader id='settings' titleId='nav.settings' title='Settings' sx={{ maxWidth: '60.625rem' }}>
        <Typography
          messageId='settings.lastUpdated'
          values={{ lastAdminToUpdate, lastUpdateTime }}
          defaultMessage={`Last updated by ${lastAdminToUpdate} on ${lastUpdateTime}`}
          variant='caption'
          sx={{ mt: 2, display: 'block', opacity: 0.7 }}
        />
      </SimpleHeader>
      <Box component='section' aria-labelledby='settings' sx={{ maxWidth: '60.625rem', margin: 'auto' }}>
        <Box sx={{ display: 'inline-block', verticalAlign: 'top', mb: 2, width: { xs: '100%', lg: '33%' }, mr: 3 }}>
          <Typography
            id='live-view'
            messageId='settings.liveView'
            defaultMessage='Live View'
            variant='h6'
            component='h2'
            sx={{ mb: 1 }}
          />
          <Typography
            messageId='settings.liveViewSubheader'
            defaultMessage='Manage real-time activity.'
            sx={{ opacity: 0.7 }}
          />
        </Box>
        <Card
          component='section'
          aria-labelledby='live-view'
          sx={{
            display: 'inline-block',
            padding: 3,
            width: { xs: '100%', lg: '60%' }
          }}
        >
          <Table aria-label='table of user counts'>
            <TableHead>
              <TableRow>
                <TableCell align='center' sx={{ border: 'none' }}>
                  <FormattedMessage
                    id='settings.loggedInCount'
                    defaultMessage='Users Logged in Right Now'
                  />
                </TableCell>
                <TableCell align='center' sx={{ border: 'none' }}>
                  <FormattedMessage
                    id='settings.anonymousCount'
                    defaultMessage='Total Users Currently Online'
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  align='center'
                  sx={{
                    border: 'none',
                    fontSize: '1.25rem',
                    fontWeight: theme => theme.typography.fontWeightBold
                  }}>
                  {sessionInfoLoading ?
                    <Skeleton variant='rectangular' width={54} height={54} sx={{ display: 'inline-block' }} /> :
                    totalAuthenticatedUsers}
                </TableCell>
                <TableCell
                  align='center'
                  sx={{
                    border: 'none',
                    fontSize: '1.25rem',
                    fontWeight: theme => theme.typography.fontWeightBold
                  }}>
                  {sessionInfoLoading ?
                    <Skeleton variant='rectangular' width={60} height={120} /> :
                    totalUsersOnline}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              messageId='settings.logoutOnlineUsers'
              defaultMessage='Logout all online users'
              sx={{ mr: 1 }}
            />
            <Button
              labelId='settings.logoutUsers'
              defaultLabel='Logout users'
              variant='contained'
              color='primary'
              onClick={handleLogoutAll}
              sx={{ my: 'auto' }}
            />
          </Box>
          <FullWidthToggle
            labelId='settings.restrictNewLogins'
            defaultLabel='Restrict all new logins'
            checked={restrictLoginToggle}
            onChange={handleToggleRestrict}
          />
        </Card>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'inline-block', verticalAlign: 'top', mb: 2, width: { xs: '100%', lg: '33%' }, mr: 3 }}>
          <Typography
            id='banner-settings'
            messageId='settings.announcementBanner'
            defaultMessage='Announcement Banner'
            component='h2'
            variant='h6'
            sx={{ mb: 1 }}
          />
          <Typography
            messageId='settings.announcementBannerSubheader'
            defaultMessage='Inform users about important information such as maintenance times or new features.'
            sx={{ opacity: 0.7 }}
          />
        </Box>
        <Card
          component='section'
          aria-labelledby='banner-settings'
          sx={{
            display: 'inline-block',
            padding: 3,
            width: { xs: '100%', lg: '60%' }
          }}
        >
          <FullWidthToggle
            labelId='settings.showAnnouncementBanner'
            defaultLabel='Show announcement banner'
            checked={bannerToggle}
            onChange={handleBannerToggle}
          />
          <Box
            component='form'
            noValidate
            onSubmit={handleSaveMessage}
          >
            <TextField
              id='announcement'
              labelId='settings.announcement'
              defaultLabel='Announcement'
              variant='outlined'
              fullWidth
              multiline
              minRows={3}
              value={announcement}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAnnouncement(e.target.value)}
              skeletonHeight={100}
              helperText={
                <>
                  <Button
                    labelId='settings.resetAnnouncement'
                    defaultLabel='Reset to default announcement'
                    color='primary'
                    onClick={handleMessageReset}
                    size='small'
                    sx={{ textTransform: 'none', textAlign: 'left', m: 0 }}
                  />
                  <FormHelperText sx={{ m: 0 }}>{announcement?.length ?? 0}/{announcementMaxLength}</FormHelperText>
                </>
              }
              slotProps={{
                formHelperText: {
                  component: 'div',
                  sx: {
                    textAlign: 'right',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 0.5,
                    mb: 2,
                    mx: 0
                  }
                },
                htmlInput: {
                  maxLength: announcementMaxLength
                }
              }}
              sx={{ mb: 0 }}
            />

            <Button
              type='submit'
              labelId='actions.save'
              defaultLabel='Save'
              variant='contained'
              color='primary'
            />
          </Box>
        </Card>
      </Box>
    </PortalMain>
  )
}

export default AdminSettings
