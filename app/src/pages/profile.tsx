import React, { useState, useContext, Fragment } from 'react'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Paper from '@mui/material/Paper'

import map from 'lodash/map'

import Button from 'PORTAL/components/basicComponents/button'
import ConfirmationDialog from 'PORTAL/components/basicComponents/confirmationDialog'
import FullWidthToggle from 'PORTAL/components/basicComponents/fullWidthToggle'
import PortalMain from 'PORTAL/components/basicComponents/portalMain'
import SimpleHeader from 'PORTAL/components/basicComponents/simpleHeader'
import TextField from 'PORTAL/components/basicComponents/textField'
import Typography from 'PORTAL/components/basicComponents/typography'
import ErrorSnackbar from 'PORTAL/components/errorSnackbar'
import SuccessSnackbar from 'PORTAL/components/successSnackbar'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import app from 'PORTAL/feathers-client'
import { isEmail, translateString } from 'PORTAL/utils'

import { ADMIN_CONTACT, RoleEnum } from 'PORTAL/constants'

interface FieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
  error?: string
}

export default function Profile() {
  const { user, reloadUser, sendResetPassword, logout } = useContext(AuthContext) as AuthContextType

  const [email, setEmail] = useState(user.email)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false)
  const [reverifyConfirmationDialogOpen, setReverifyConfirmationDialogOpen] = useState(false)

  const INVALID_EMAIL_ERROR = translateString('register.errors.validEmail', 'Please enter a valid email address.')
  const EMAIL_FAIL_MESSAGE = translateString('profile.errors.emailUpdateFail', 'There was a problem updating your email address. Please try again later.')
  const PASSWORD_SUCCESS_MESSAGE = translateString('profile.passwordSuccess', 'A link has been sent to your email to create a new password. Check your inbox.')
  const PASSWORD_FAIL_MESSAGE = translateString('profile.errors.passwordFail', 'There was a problem updating your password. Please try again later.')
  const NOTIFICATIONS_SUCCESS_MESSAGE_ON = translateString('profile.emailSubscriptionSuccessOn', 'Settings updated! Email notifications are now on.')
  const NOTIFICATIONS_SUCCESS_MESSAGE_OFF = translateString('profile.emailSubscriptionSuccessOff', 'Settings updated! Email notifications are now off.')
  const NOTIFICATIONS_FAIL_MESSAGE = translateString('profile.errors.emailSubscriptionFail', 'A link has been sent to your email to create a new password. Check your inbox.')
  const DELETE_CONFIRM_TITLE = translateString('profile.deleteAccount', 'Delete Account')
  const EMAIL_CONFIRM_TITLE = translateString('profile.confirmEmailChange', 'Confirm Email Update')
  const EMAIL_CONFIRM = translateString('profile.confirm', 'Confirm')
  const CONTINUE_TEXT = translateString('actions.delete', 'Delete')

  const hasChanges = email !== user.email

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
    setFieldErrors({})
  }

  const handleSubmitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setSuccessMessage(null)
    setErrorMessage(null)
    setIsSubmitting(true)

    if (!isEmail(email)) {
      setFieldErrors({ email: INVALID_EMAIL_ERROR })
      setIsSubmitting(false)
      return
    }

    setReverifyConfirmationDialogOpen(true)
  }

  const handleEmailSubscriptionChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldErrors({})
    setSuccessMessage(null)
    setErrorMessage(null)
    setIsSubmitting(true)

    const checked = event.target.checked

    try {
      await app.service('users').patch(user.id, { subscribed: checked })
      await reloadUser() // Reload user data after update
      if (checked) {
        setSuccessMessage(NOTIFICATIONS_SUCCESS_MESSAGE_ON)
      } else {
        setSuccessMessage(NOTIFICATIONS_SUCCESS_MESSAGE_OFF)
      }
    } catch (error) {
      setErrorMessage(NOTIFICATIONS_FAIL_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendPasswordReset = async () => {
    setFieldErrors({})
    setSuccessMessage(null)
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await sendResetPassword(user.email)
      setSuccessMessage(PASSWORD_SUCCESS_MESSAGE)
    } catch (error) {
      setErrorMessage(PASSWORD_FAIL_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = () => {
    logout()
  }

  const handleReverifyConfirm = async () => {
    try {
      await app.service('users').patch(user.id, { email })
      logout()
    } catch (error) {
      setErrorMessage(EMAIL_FAIL_MESSAGE)
    } finally {
      setIsSubmitting(false)
      setReverifyConfirmationDialogOpen(false)
    }
  }

  const sections = [
    {
      id: 'email',
      titleId: 'profile.emailSettings',
      subTitleId: 'profile.emailSettingsDescription',
      cardContent: <>
        <TextField
          id='email'
          labelId='profile.email'
          defaultLabel='Email address'
          variant='outlined'
          fullWidth
          value={email}
          onChange={handleEmailInputChange}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email || ' '}
        />
        <Button
          labelId='actions.saveChanges'
          defaultLabel='Save changes'
          type='submit'
          variant='contained'
          disabled={isSubmitting || !hasChanges}
          sx={{ mb: 0 }}
        />
      </>
    },
    {
      id: 'notifications',
      titleId: 'profile.emailNotifications',
      subTitleId: 'profile.emailNotificationsDescription',
      cardContent: <>
        <FullWidthToggle
          labelId='profile.emailSubscription'
          defaultLabel='Receive email notifications'
          checked={user.subscribed}
          disabled={isSubmitting}
          onChange={handleEmailSubscriptionChange}
          sx={{ my: -1 }}
        />
      </>
    },
    {
      id: 'password',
      titleId: 'profile.passwordSettings',
      subTitleId: 'profile.resetPasswordMessage',
      cardContent: <>
        <Typography
          messageId='profile.sendResetLink'
          defaultMessage='Send password reset link'
          sx={{ mb: 2, fontWeight: 700 }}
        />
        <Button
          labelId='profile.resetPassword'
          defaultLabel='Reset password'
          disabled={isSubmitting}
          onClick={handleSendPasswordReset}
          variant='contained'
          sx={{ m: 0 }}
        />
      </>
    },
    {
      id: 'delete',
      titleId: 'profile.deleteAccount',
      subtitleContent: <>
        <Typography
          messageId='profile.deleteAccountWill'
          defaultMessage='Deleting your account will:'
          sx={{ opacity: 0.7 }}
        />
        <List disablePadding sx={{ listStyleType: 'disc', pl: 2, ml: 1, mb: 3, opacity: 0.7 }}>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            <Typography
              messageId='profile.logOutDevices'
              defaultMessage='Log you out on all devices'
            />
          </ListItem>
          <ListItem disablePadding sx={{ display: 'list-item' }}>
            <Typography
              messageId='profile.deleteAccountInfo'
              defaultMessage='Delete all your account information'
            />
          </ListItem>
        </List>
      </>,
      cardContent: <>
        <Typography
          sx={{ mb: 2, fontWeight: 700 }}
          messageId='profile.deleteConnectAccount'
          defaultMessage='Delete your Connect account'
        />
        <Button
          disabled={isSubmitting}
          color='error'
          variant='contained'
          labelId='profile.deleteAccount'
          defaultLabel='Delete Account'
          onClick={() => setDeleteConfirmationDialogOpen(true)}
          sx={{ m: 0 }}
        />
      </>,
      belowCardContent: <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row', gap: 2 } }}>
        <Typography
          fontWeight='bold'
          messageId='profile.notAffectParticipation'
          defaultMessage='Deleting your account will not affect your participation in any research studies. You will remain part of the study, even after your account is deleted.'
          sx={{ mb: 2, opacity: 0.7 }}
        />
        {user.role === RoleEnum.PARTICIPANT &&
          <Typography
            messageId='consents.withdraw'
            defaultMessage='If you wish to withdraw from the study at any time, please contact the study coordinator at <1>{{values}}</1>.'
            values={{ admin_contact: ADMIN_CONTACT }}
            sx={{ mb: 2 }}
            fontWeight='bold'
            color='error'
          >
            If you wish to withdraw from the study at any time, please contact the study coordinator at
            <Link color='error' href={`mailto:${ADMIN_CONTACT}`} target='_blank' rel='noopener noreferrer'>
              {ADMIN_CONTACT}
            </Link>
          </Typography>
        }
      </Box>
    }
  ]
  return (
    <PortalMain>
      <ConfirmationDialog
        open={deleteConfirmationDialogOpen}
        onClose={() => setDeleteConfirmationDialogOpen(false)}
        onContinue={handleDeleteAccount}
        title={DELETE_CONFIRM_TITLE}
        continueText={CONTINUE_TEXT}
        body={
          <>
            <Typography messageId='profile.areYouSure' defaultMessage='Are you sure you want to delete your account?' sx={{ mb: 2 }} />
            <Typography messageId='profile.permanentlyDelete' defaultMessage='You will permanently delete your account and log you out from all devices.' />
          </>
        }
      />
      <ConfirmationDialog
        open={reverifyConfirmationDialogOpen}
        onClose={() => {
          setReverifyConfirmationDialogOpen(false)
          setIsSubmitting(false)
        }}
        onContinue={handleReverifyConfirm}
        title={EMAIL_CONFIRM_TITLE}
        continueText={EMAIL_CONFIRM}
        continueColor='primary'
        body={
          <>
            <Typography messageId='profile.confirmEmailDescription1' defaultMessage='Are you sure you want to update your email address?' sx={{ mb: 2 }} />
            <Typography messageId='profile.confirmEmailDescription2' defaultMessage='You will be logged out of your account and asked to reverify your new email address.' />
          </>
        }
      />
      <SuccessSnackbar open={!!successMessage} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ErrorSnackbar open={!!errorMessage} message={errorMessage} onClose={() => setErrorMessage('')} />
      <SimpleHeader id='settings' titleId='profile.title' title='Settings' />
      <Box component='section' aria-labelledby='settings' sx={{ maxWidth: '60.625rem', margin: 'auto' }}>
        {
          map(sections, (section, index) => (
            <Fragment key={section.id}>
              <Box
                component='section'
                aria-labelledby={section.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: { xs: 'column', md: 'row' },
                  mb: 2,
                  gap: { xs: 0, md: 1.5 }
                }}
              >
                <Box sx={{ width: { xs: '100%', md: '33%' } }}>
                  <Typography
                    id={section.id}
                    component='h2'
                    variant='h6'
                    messageId={section.titleId}
                    sx={{ mb: 2 }}
                  />
                  {
                    section.subtitleContent || <Typography messageId={section.subTitleId} sx={{ opacity: 0.7, mb: index === 0 ? 3 : 1 }} />
                  }
                </Box>
                <Paper
                  elevation={0}
                  component='form'
                  noValidate
                  onSubmit={handleSubmitEmail}
                  sx={theme => ({
                    borderRadius: { xs: 0, md: 2 },
                    border: '1px rgba(0, 0, 0, 0.05) solid',
                    width: { xs: `calc(100% + ${theme.spacing(6)})`, md: '66%' },
                    p: 2.5,
                    mx: { xs: -3, md: 0 },
                  })}
                >
                  {section.cardContent}
                </Paper>
              </Box>
              {section.belowCardContent && section.belowCardContent}
              {
                index < sections.length - 1 && <Divider flexItem sx={{ mt: { xs: 3, md: 2 }, mb: { xs: 4, md: 3 } }} />
              }
            </Fragment>
          ))
        }
      </Box>
    </PortalMain>
  )
}
