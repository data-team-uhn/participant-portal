import find from 'lodash/find'
import type { ModulesType } from 'PORTAL/declarations'
import React, { useContext, useState } from 'react'

import moment from 'moment'

import Button from 'PORTAL/components/basicComponents/button'
import Typography from 'PORTAL/components/basicComponents/typography'
import ErrorSnackbar from 'PORTAL/components/errorSnackbar'
import SurveyDialog from 'PORTAL/components/surveys/surveyDialog'
import { AuthContext, type AuthContextType } from 'PORTAL/contexts/auth'
import { SurveyProvider } from 'PORTAL/contexts/surveyContext'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

interface Props {
  onSurveyClose: () => void
  modules: ModulesType[]
}

const ParticipantWelcome = ({ modules, onSurveyClose }: Props) => {
  const [openConsent, setOpenConsent] = useState(false)
  const [error, setError] = useState(false)

  const { user, reloadUser } = useContext(AuthContext) as AuthContextType
  const GENERIC_ERROR = translateString('errors.generic', 'Something went wrong. Please try again later.')

  const consent = find(modules, { type: 'consent' }) as ModulesType
  if (!consent) {
    setError(true)
  }

  const form = consent.form
  const formId = consent.id
  const formResponse = consent.form_responses

  const handleClose = async () => {
    reloadUser()
    setOpenConsent(false)
    onSurveyClose()
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

  return (
    <SurveyProvider
      form={form}
      formId={formId}
      formResponses={formResponse}
    >
      <ErrorSnackbar open={error} onClose={() => setError(false)} message={GENERIC_ERROR} />
      <SurveyDialog open={openConsent} onClose={handleClose} onSubmit={handleClose} />
      <Typography component='h1' variant='h5' messageId='dashboard.hello' defaultMessage='Hello!' sx={{ mb: 2 }} />
      <Typography
        messageId='dashboard.welcomeText'
        defaultMessage='You have been invited to participate in the Connect Portal. Please review and complete the Informed consent Form for participation in the Connect Registry by clicking the button below.'
        sx={{ mb: 5 }}
      />
      <Button
        labelId='actions.start'
        defaultLabel='start'
        variant='contained'
        onClick={handleOpenConsent}
        sx={{ width: 'fit-content' }}
      />
    </SurveyProvider>
  )
}

export default ParticipantWelcome
