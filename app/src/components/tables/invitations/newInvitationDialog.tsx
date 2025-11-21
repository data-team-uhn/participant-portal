import React, { useContext, useState, useReducer } from 'react'

import { keys, each, isEmpty, map } from 'lodash'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormLabel from '@mui/material/FormLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import TextField from '@mui/material/TextField'

import Dialog from 'PORTAL/components/basicComponents/dialog'
import Select from 'PORTAL/components/basicComponents/select'
import Typography from 'PORTAL/components/basicComponents/typography'
import ErrorSnackbar from 'PORTAL/components/errorSnackbar'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import { DataSourceType } from 'PORTAL/declarations'
import app from 'PORTAL/feathers-client'
import { translateString, isEmail } from 'PORTAL/utils'

type NewInvitationDialogProps = {
  open: boolean
  onClose: () => void
  study_id: string
  data_sources: Array<DataSourceType>
}

const NewInvitationDialog: React.FC<NewInvitationDialogProps> = (props: NewInvitationDialogProps) => {

  const { open, onClose, study_id, data_sources } = props

  const { user } = useContext(AuthContext) as AuthContextType

  interface fieldErrors {
    userType?: string,
    email?: string,
    confirmEmail?: string,
    dataSource?: string
    error?: string
  }

  const initialData = {
    userType: 'participant',
    email: '',
    confirmEmail: '',
    dataSource: '',
  }

  const [data, updateData] = useReducer((prevState, data) => {
    return { ...prevState, ...data }
  }, initialData)
  const [fieldErrorsMapping, setFieldErrorsMapping] = useState<fieldErrors>({})
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false)

  const EMPTY_FIELD_ERROR = translateString('common.errors.emptyField', 'Don\'t forget to fill this out')
  const INVALID_EMAIL_ERROR = translateString('register.errors.validEmail', 'Please enter a valid email address.')
  const RECIPIENT_UNIQUE_ERROR = translateString('invitations.errors.unique', 'This recipient has already been invited to this study')
  const GENERIC_ERROR = translateString('invitations.errors.generic', 'An error occurred creating the invitations.')
  const EMAIL_MISMATCH_ERROR = translateString('invitations.errors.emailMismatch', 'Email addresses must match')

  const handleClose = () => {
    updateData(initialData)
    setFieldErrorsMapping({})
    onClose()
  }

  const createInvitation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors: any = {}
    setIsSubmitButtonDisabled(true)

    const fields = keys(initialData)

    each(fields, (fieldName: string) => {

      if (!data[fieldName]) {
        errors[fieldName] = EMPTY_FIELD_ERROR
      }
    })

    if (data.email && !isEmail(data.email)) {
      errors.email = INVALID_EMAIL_ERROR
    }

    if (data.email && data.email !== data.confirmEmail) {
      errors.confirmEmail = EMAIL_MISMATCH_ERROR
    }

    if (!isEmpty(errors)) {
      setFieldErrorsMapping(errors)
      setIsSubmitButtonDisabled(false)
      return
    }

    return app.service('invitations').create({
      type: data.userType,
      study_id,
      data_source_ids: [data.dataSource],
      recipient: data.email
    })
      .then(() => {
        setFieldErrorsMapping({})
        setIsSubmitButtonDisabled(false)
        handleClose()
      })
      .catch((e: Error) => {
        if (e.message === 'Validation error') {
          errors.recipient = RECIPIENT_UNIQUE_ERROR
        } else {
          errors.error = GENERIC_ERROR
        }
        setFieldErrorsMapping(errors)
        setIsSubmitButtonDisabled(false)
      })
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          noValidate: true,
          component: 'form',
          // @ts-ignore
          onSubmit: createInvitation
        }
      }}
    >
      <DialogTitle component='div'>
        <Typography component='h2' variant='h4' messageId='invitations.inviteParticipant' defaultMessage='Invite Participant' sx={{ mb: 2 }} />
        <Typography messageId='invitations.emailParticipant' defaultMessage='Email a participant an invitation to join the Connect Portal' />
      </DialogTitle>
      <DialogContent>
        {/* leave out for now
          user.role === 'admin' &&
          <>
            <FormLabel htmlFor='userType'>
              <FormattedMessage id='invitations.userType' defaultMessage='User Type' />
            </FormLabel>
            <Select
              id="userType"
              value={data.userType}
              onChange={(e => {
                updateData({ userType: e.target.value })
                setFieldErrorsMapping(prev => ({ ...prev, userType: '' }))
              })}
              fullWidth
              error={!!fieldErrorsMapping.userType}
              sx={{ mb: 2 }}
              native
            >
              <option value={'participant'} >
                <FormattedMessage id='invitations.participant' defaultMessage='Participant' />
              </option>
              {user.role === 'admin' &&
                <option value={'coordinator'}>
                  <FormattedMessage id='invitations.coordinator' defaultMessage='Coordinator' />
                </option>}
            </Select>
          </>*/}

        <FormLabel htmlFor='dataSource'>
          <FormattedMessage id='invitations.dataSource' defaultMessage='Data Source(s)' />
        </FormLabel>
        <Select
          id="dataSource"
          value={data.dataSource}
          onChange={(e => {
            updateData({ dataSource: e.target.value })
            setFieldErrorsMapping(prev => ({ ...prev, dataSource: '' }))
          })}
          fullWidth
          error={!!fieldErrorsMapping.dataSource}
          helperText={fieldErrorsMapping.dataSource || ' '}
          input={<OutlinedInput id="native-select-outlined"/>}
        >
          <option value='' disabled></option>
          {map(data_sources, (data_source, index) =>
            <option value={data_source.id} key={`data-source-option-${index}`}>
              {data_source.name}
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
          error={!!fieldErrorsMapping.email}
          helperText={fieldErrorsMapping.email || ' '}
          value={data.email}
          onChange={(e => {
            updateData({ email: e.target.value })
            setFieldErrorsMapping(prev => ({ ...prev, email: '' }))
          })}
        />

        <FormLabel htmlFor='confirmEmail'>
          <FormattedMessage id='invitations.confirmEmail' defaultMessage='Confirm email' />
        </FormLabel>
        <TextField
          required
          fullWidth
          id='confirmEmail'
          name='confirmEmail'
          autoComplete='confirmEmail'
          error={!!fieldErrorsMapping.confirmEmail}
          helperText={fieldErrorsMapping.confirmEmail || ' '}
          value={data.confirmEmail}
          onChange={(e => {
            updateData({ confirmEmail: e.target.value })
            setFieldErrorsMapping(prev => ({ ...prev, confirmEmail: '' }))
          })}
        />

        <ErrorSnackbar open={!!(fieldErrorsMapping.error)} message={fieldErrorsMapping.error} onClose={() => { setFieldErrorsMapping({ error: '' }) }} />
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleClose}
          variant='outlined'
          sx={{ display: 'block', my: 2 }}
        >
          <FormattedMessage id='actions.cancel' defaultMessage='Cancel' />
        </Button>
        <Button
          disabled={isSubmitButtonDisabled}
          variant='contained'
          type='submit'
          sx={{ display: 'block', my: 2 }}
        >
          <FormattedMessage id='invitations.invite' defaultMessage='Invite' />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NewInvitationDialog
