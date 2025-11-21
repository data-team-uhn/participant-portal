import React, { useReducer, useState, useRef } from 'react'
import Reaptcha from 'reaptcha'
import { keys, each, isEmpty } from 'lodash'

import Button from '@mui/material/Button'
import Dialog from 'PORTAL/components/basicComponents/dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import FormError from 'PORTAL/components/formError'
import isOnMobile from 'PORTAL/hooks/isOnMobile'

import app from 'PORTAL/feathers-client'
import { isEmail, translateString } from 'PORTAL/utils'
import { GOOGLE_CAPTCHA_ENABLED, GOOGLE_CAPTCHA_SITE_KEY } from 'PORTAL/constants'

type ContactDialogProps = {
  open: boolean,
  onClose: () => void
  setSuccessMessage: (message: string) => void
}

interface fieldErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
  error?: string
}

const initialData = {
  name: '',
  email: '',
  subject: '',
  message: ''
}

const ContactDialog = (props: ContactDialogProps) => {

  const onMobile = isOnMobile()

  const { open, onClose, setSuccessMessage } = props

  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<fieldErrors>({})
  const [data, updateData] = useReducer((prevState, data) => {
    return { ...prevState, ...data }
  }, initialData)

  const captchaRef = useRef(null)

  const EMPTY_FIELD_ERROR = translateString('common.errors.emptyField', 'Don\'t forget to fill this out')
  const EMAIL_ERROR = translateString('register.errors.validEmail', 'Please enter a valid email address')
  const GENERIC_ERROR = translateString('landing.contactFormError', 'There was a problem sending the message. Please try again later.')
  const SUCCESS_MESSAGE = translateString('landing.contactFormSuccess', 'Your message has been sent successfully!')

  const handleCaptcha = (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!GOOGLE_CAPTCHA_ENABLED) return
    if (!captchaRef.current) return

    captchaRef.current.renderExplicitly().then(
      () => captchaRef.current.execute())
      .catch(() => captchaRef.current.execute()
      )
  }

  const handleSubmit = (captcha_response) => {
    if (!captcha_response) {
      if (captchaRef.current) {
        captchaRef.current.reset()
      }
    }

    const errors: any = {}
    setIsSubmitButtonDisabled(true)

    const fields = keys(initialData)

    each(fields, (fieldName: string) => {

      if (!data[fieldName]) {
        errors[fieldName] = EMPTY_FIELD_ERROR
      }
    })

    const email = data.email.trim()
    if (email && !isEmail(email)) {
      errors.email = EMAIL_ERROR
    }

    if (!isEmpty(errors)) {
      setFieldErrors(errors)
      setIsSubmitButtonDisabled(false)
      return
    }
    return app.service('contact-form').create({ ...data, captcha_response })
    .then(() => {
      setSuccessMessage(SUCCESS_MESSAGE)
      updateData(initialData)
      setIsSubmitButtonDisabled(false)
      onClose()
    })
    .catch(() => setFieldErrors({ error: GENERIC_ERROR }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={'md'}
      fullWidth
      fullScreen={onMobile}
      component='form'
      onSubmit={handleCaptcha}
    >
      <DialogTitle component='h1' variant='h4'>
        <FormattedMessage id='landing.contactUs' defaultMessage='Contact Us' />
      </DialogTitle>
      <DialogContent>
        
        <FormLabel htmlFor='name'>
          <FormattedMessage id='landing.name' defaultMessage='Name' />
        </FormLabel>
        <TextField
          required
          fullWidth
          id='name'
          name='name'
          autoComplete='enter your name'
          error={!!fieldErrors.name}
          helperText={fieldErrors.name || ' '}
          value={data.name}
          onChange={(e => {
            updateData({ name: e.target.value })
            setFieldErrors(prev => ({ ...prev, email: '' }))
          })}
        />

        <FormLabel htmlFor='email'>
          <FormattedMessage id='login.email' defaultMessage='Email' />
        </FormLabel>
        <TextField
          required
          fullWidth
          id='email'
          name='email'
          autoComplete='email'
          error={!!fieldErrors.email}
          helperText={fieldErrors.email || ' '}
          value={data.email}
          onChange={(e => {
            updateData({ email: e.target.value })
            setFieldErrors(prev => ({ ...prev, email: '' }))
          })}
        />

        <FormLabel htmlFor='subject'>
          <FormattedMessage id='landing.subject' defaultMessage='Name' />
        </FormLabel>
        <TextField
          required
          fullWidth
          id='subject'
          name='subject'
          autoComplete='enter your subject'
          error={!!fieldErrors.subject}
          helperText={fieldErrors.subject || ' '}
          value={data.subject}
          onChange={(e => {
            updateData({ subject: e.target.value })
            setFieldErrors(prev => ({ ...prev, email: '' }))
          })}
        />

        <FormLabel htmlFor='message'>
          <FormattedMessage id='landing.message' defaultMessage='Message??' />
        </FormLabel>
        <TextField
          required
          multiline
          minRows={5}
          fullWidth
          id='message'
          name='message'
          autoComplete='enter your message'
          error={!!fieldErrors.message}
          helperText={fieldErrors.message || ' '}
          value={data.message}
          onChange={(e => {
            updateData({ message: e.target.value })
            setFieldErrors(prev => ({ ...prev, email: '' }))
          })}
        />

        <Reaptcha
          ref={captchaRef}
          sitekey={GOOGLE_CAPTCHA_SITE_KEY}
          onVerify={captcha_response => handleSubmit(captcha_response)}
          size='invisible'
          explicit
        />

        <FormError id='contact-us-error' error={fieldErrors.error} onClose={() => { setFieldErrors({ error: '' }) }} />

      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          margin: 'auto'
        }}
      >
        <Button variant='contained' size='large' type='submit' disabled={isSubmitButtonDisabled}>
          <FormattedMessage
            id='actions.submit'
            defaultMessage='Submit'
          />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContactDialog
