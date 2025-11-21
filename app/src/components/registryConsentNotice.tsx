import React, { useContext, useState, useEffect } from 'react'

import get from 'lodash/get'
import moment from 'moment'

import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

import Button from 'PORTAL/components/basicComponents/button'
import Dialog from 'PORTAL/components/basicComponents/dialog'
import Typography from 'PORTAL/components/basicComponents/typography'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import SurveyDialog from 'PORTAL/components/surveys/surveyDialog'
import { RoleEnum } from 'PORTAL/constants'
import { AuthContext } from 'PORTAL/contexts/auth'
import { SurveyProvider } from 'PORTAL/contexts/surveyContext'
import app from 'PORTAL/feathers-client'

import type { AuthContextType } from 'PORTAL/contexts/auth'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

interface DialogProps {
  open: boolean
  onClose: () => void
  onError: (error: Error) => void
}

const RegistryConsentNoticeDialog = ({ open, onClose, onError }: DialogProps) => {
  const [openConsent, setOpenConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [form, setForm] = useState(null)
  const [formId, setFormId] = useState(null)
  const [formResponse, setFormResponse] = useState(null)

  const { user, reloadUser } = useContext(AuthContext) as AuthContextType

  const fetchForm = async () => {
    const studyResponse = await app.service('studies').find({
      query: {
        external_study_id: REGISTRY_EXTERNAL_ID,
        $limit: 1
      }
    })
    const study = studyResponse.data[0]

    // This study should always exist in prod, but we check just in case
    if (!study) {
      setError(true)
      onError(new Error('Study not found'))
      return
    }

    const forms = await app.service('forms').find({
      query: {
        study_id: study.id,
        name: 'consent',
        $limit: 1,
        $sort: { version: -1 }
      }
    })
    const formData = get(forms, 'data[0]', {})

    // This form should always exist in prod, but we check just in case
    if (!formData) {
      setError(true)
      onError(new Error('Form not found'))
      return
    }

    const formResponses = await app.service('form-responses').find({
      query: {
        form_id: formData.id
      }
    })
    const formResponseData = get(formResponses, 'data[0]', {})

    setForm(formData.form)
    setFormId(formData.id)
    setFormResponse(formResponseData)
  }

  useEffect(() => {
    // Only fetch the form and study if the participant has not signed the consent
    if (user.role !== 'participant' || user.participant.contact_permission_confirmed !== null) {
      onClose()
      return
    }
    setIsLoading(true)
    fetchForm().then(() => {
      setIsLoading(false)
    })
  }, [])

  const handleClose = async () => {
    reloadUser()
    setOpenConsent(false)
    onClose()
  }

  const handleOpenConsent = async () => {
    const viewed_registry_consent = moment()

    await app.service('participants').patch(user.participant.id, {
      viewed_registry_consent
    })

    // Don't reload user here so that we can show the user the consent form.
    // Wait to reload until the user closes this dialog
    setOpenConsent(true)
  }

  if (isLoading || error || user.role !== RoleEnum.PARTICIPANT) {
    return null
  }

  return (
    <SurveyProvider
      form={form}
      formId={formId}
      formResponses={formResponse}
    >
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <SurveyDialog open={openConsent} onClose={handleClose} loadData={fetchForm} onSubmit={handleClose} />
        <DialogTitle variant='h4' component='h1'>
          <FormattedMessage id='dashboard.hello' defaultMessage='Hello!' />
        </DialogTitle>
        <DialogContent>
          <Typography
            gutterBottom
            messageId='dashboard.welcomeText'
            defaultMessage='You have been invited to participate in the Connect Portal. Please review and complete the Informed consent Form for participation in the Connect Registry by clicking the button below.' />
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            margin: 'auto'
          }}
        >
          <Button
            labelId='actions.later'
            defaultLabel='Maybe later'
            variant='outlinedGreyscale'
            onClick={handleClose}
          />
          <Button
            labelId='actions.reviewConsent'
            defaultLabel='Review consent'
            variant='contained'
            onClick={handleOpenConsent}
          />
        </DialogActions>
      </Dialog>
    </SurveyProvider>
  )
}

export default RegistryConsentNoticeDialog
