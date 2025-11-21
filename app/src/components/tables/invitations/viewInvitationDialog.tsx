import React, { useState } from 'react'

import { map } from 'lodash'
import moment from 'moment'

import Box from '@mui/material/Box'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormLabel from '@mui/material/FormLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import QrCode2Icon from '@mui/icons-material/QrCode2'

import Button from 'PORTAL/components/basicComponents/button'
import ConfirmationDialog from 'PORTAL/components/basicComponents/confirmationDialog'
import Dialog from 'PORTAL/components/basicComponents/dialog'
import Select from 'PORTAL/components/basicComponents/select'
import Typography from 'PORTAL/components/basicComponents/typography'
import ErrorSnackbar from 'PORTAL/components/errorSnackbar'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import QRCodeDialog from 'PORTAL/components/tables/invitations/qrCodeDialog'
import { MAX_CONTACT_TIMES } from 'PORTAL/constants'
import { InvitationType } from 'PORTAL/declarations'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

type UpdateInvitationDialogProps = {
  open: boolean
  onClose: () => void
  invitation: InvitationType
  setSuccessSnackbarMessage: (message: string) => void
}

enum TabsEnum {
  MANAGE = 'Manage Invitation',
  MESSAGES = 'View Sent Invitations'
}

const APP_BASE_URL = process.env.APP_BASE_URL

const UpdateInvitationDialog: React.FC<UpdateInvitationDialogProps> = (props: UpdateInvitationDialogProps) => {

  const { open, onClose, invitation, setSuccessSnackbarMessage } = props

  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [viewRevokeConfirmationDialog, setViewRevokeConfirmationDialog] = useState(false)
  const [viewQrCode, setViewQrCode] = useState(false)
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState('')
  const [currentTab, setCurrentTab] = useState(0)

  const GENERIC_ERROR = translateString('errors.generic', 'Something went wrong. Please try again later.')
  const RESEND_SUCCESS_MESSAGE = translateString('invitations.resentSuccessfully', 'The invitation has been resent successfully.')
  const REVOKE_SUCCESS_MESSAGE = translateString('invitations.revokedSuccessfully', 'The invitation has been revoked successfully.')
  const REVOKE_CONFIRM_TITLE = translateString('invitations.revokeConfirmation', 'Revoke Confirmation')
  const REVOKE_CONTINUE_TEXT = translateString('invitations.revoke', 'Revoke')
  const MANAGE_INVITATION = translateString('invitations.manageInvitation', 'Manage Invitation')
  const VIEW_INVITATIONS_SENT = translateString('invitations.viewInvitationsSent', "View Invitations Sent")

  const MAX_INVITES_REACHED = invitation && (invitation.total_messages_sent >= MAX_CONTACT_TIMES)

  const handleResend = async () => {
    setIsButtonDisabled(true)
    try {
      await app.service('invitations').patch(invitation.id, { sent_by: 'me' })
      setIsButtonDisabled(false)
      setSuccessSnackbarMessage(RESEND_SUCCESS_MESSAGE)
      onClose()
    } catch {
      setIsButtonDisabled(false)
      setErrorSnackbarMessage(GENERIC_ERROR)
    }
  }

  const handleRevoke = async () => {
    setIsButtonDisabled(true)
    try {
      await app.service('invitations').patch(invitation.id, { revoked_by: 'me' })
      setViewRevokeConfirmationDialog(false)
      setIsButtonDisabled(false)
      setSuccessSnackbarMessage(REVOKE_SUCCESS_MESSAGE)
      onClose()
    } catch {
      setIsButtonDisabled(false)
      setErrorSnackbarMessage(GENERIC_ERROR)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }

  /**
   * this is copied from the MUI tabs page: https://mui.com/material-ui/react-tabs/
   */
  function a11yProps(index: number) {
    return {
      id: `invitation-tab-${index}`,
      'aria-controls': `invitation-tabpanel-${index}`,
    };
  }

  if (!invitation) {
    return null
  }

  return (
    <>
      <QRCodeDialog
        open={viewQrCode}
        onClose={() => setViewQrCode(false)}
        url={`${APP_BASE_URL}/?type=participant&token=${invitation.token}&email=${invitation.recipient}`}
      />
      <ConfirmationDialog
        open={viewRevokeConfirmationDialog}
        onClose={() => setViewRevokeConfirmationDialog(false)}
        onContinue={handleRevoke}
        title={REVOKE_CONFIRM_TITLE}
        continueText={REVOKE_CONTINUE_TEXT}
        body={
          <>
            <Typography
              messageId='invitations.areYouSure'
              defaultMessage='Are you sure you want to revoke the invitation for {{recipient}}?'
              values={{ recipient: invitation.recipient }}
              sx={{ mb: 2 }}
            />
            <Typography
              messageId='invitations.notAccess'
              defaultMessage='This user will no longer be able to register for Connect using the link emailed to them.'
            />
          </>
        }
      />
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { height: { xs: '100vh', md: '90vh' } }
          }
        }}
      >
        <DialogTitle component='div'>
          <Typography
            component='h2'
            variant='h4'
            messageId='invitations.updateInvitation'
            defaultMessage='Update Invitation'
            sx={{ mb: 2 }}
          />
          {!!invitation.revoked_by &&
            <Typography
              messageId='invitations.revokedInvitation'
              defaultMessage='This invitation has been revoked.'
              color='error'
              sx={{ mt: 2 }}
            />}
        </DialogTitle>
        <DialogContent sx={{ display: 'block', gap: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="invitation view options" sx={{ mb: 2 }}>
            <Tab label={MANAGE_INVITATION} {...a11yProps(0)} />
            <Tab label={VIEW_INVITATIONS_SENT} {...a11yProps(1)} />
          </Tabs>
          <Box hidden={currentTab !== 0}>
            <FormLabel htmlFor='dataSource'>
              <FormattedMessage id='invitations.dataSource' defaultMessage='Data Source(s)' />
            </FormLabel>
            <Select
              id="dataSource"
              value={invitation.data_source}
              fullWidth
              input={<OutlinedInput id="native-select-outlined" />}
              disabled
            >
              <option value='' disabled></option>
              {map([invitation.data_source], (data_source, index) =>
                <option value={data_source} key={`data-source-option-${index}`}>
                  {data_source}
                </option>
              )}
            </Select>

            <FormLabel htmlFor='email'>
              <FormattedMessage id='invitations.emailAddress' defaultMessage='Email address' />
            </FormLabel>
            <TextField
              required
              fullWidth
              id='email'
              name='email'
              autoComplete='email'
              value={invitation.recipient}
              disabled
            />

            <Button
              variant='outlinedGreyscale'
              sx={{ lineHeight: 1.5, mt: 3 }}
              onClick={() => setViewQrCode(true)}
              startIcon={<QrCode2Icon />}
            >
              <FormattedMessage id='invitations.showQrCode' defaultMessage='Show QR Code' />
            </Button>
            <Button
              variant='outlinedGreyscale'
              sx={{ lineHeight: 1.5, display: 'block', mt: 2 }}
              onClick={handleResend}
              disabled={isButtonDisabled || !!invitation.revoked_by || MAX_INVITES_REACHED}
              labelId='invitations.resendInvitation'
              defaultLabel='Resend Invitation'
            />
            {MAX_INVITES_REACHED && <Typography variant='caption' color='error'>A participant can only be contacted a maximum of 5 times</Typography>}
          </Box>
          <Box hidden={currentTab !== 1}>
            <Typography variant='h5' component='h2' sx={{ my: 2 }}>Times sent: {invitation.total_messages_sent}</Typography>
            {map(invitation.sent_messages, (message, index) => (
              <Box key={`sent_log_${index}`}>
                <Typography key={`sent_by_${index}`}><strong>Sent by: </strong> {message.triggered_by}</Typography>
                <Typography key={`sent_at_${index}`} sx={{ mb: 2 }}><strong>Sent at: </strong> {moment(message.sent_at).format('YYYY-MM-DD HH:mm')}</Typography>
              </Box>
            ))}
          </Box>

          <ErrorSnackbar open={!!errorSnackbarMessage} message={errorSnackbarMessage} onClose={() => setErrorSnackbarMessage('')} />

        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={onClose}
            variant='outlinedGreyscale'
            sx={{ display: 'block', my: 2 }}
          >
            <FormattedMessage id='actions.cancel' defaultMessage='Cancel' />
          </Button>
          <Button
            disabled={isButtonDisabled || !!invitation.revoked_by}
            variant='contained'
            sx={{ display: 'block', my: 2 }}
            color='error'
            onClick={() => setViewRevokeConfirmationDialog(true)}
          >
            <FormattedMessage id='invitations.revoke' defaultMessage='Revoke' />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )

}

export default UpdateInvitationDialog
