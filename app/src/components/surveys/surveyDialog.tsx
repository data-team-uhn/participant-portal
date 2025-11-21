import React, { useContext, useState } from 'react'

import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'

import Dialog from 'PORTAL/components/basicComponents/dialog'
import Typography from 'PORTAL/components/basicComponents/typography'
import FormError from 'PORTAL/components/formError'
import Survey from 'PORTAL/components/surveys/survey'
import SurveyExitDialog from 'PORTAL/components/surveys/surveyExitDialog'
import SurveyNav from 'PORTAL/components/surveys/surveyNav'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import { useSurvey } from 'PORTAL/contexts/surveyContext'
import type { FormResponse } from 'PORTAL/declarations'
import app from 'PORTAL/feathers-client'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit?: () => Promise<void>
  loadData?: () => void
}

const SurveyDialog = (props: Props) => {
  const {
    open,
    onClose,
    loadData,
    onSubmit
  } = props
  const { user } = useContext(AuthContext) as AuthContextType
  const {
    survey,
    responsesData,
    reset,
    currentPageNum,
    totalPages,
    furthestPageCompleted,
    formId,
    responseComplete,
    responsesId
  } = useSurvey()
  const [isClosingSurvey, setIsClosingSurvey] = useState(false)
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false)
  const [error, setError] = useState('')

  const completedAmount = (currentPageNum * 100) / (totalPages - 1)

  const handleCloseRequest = () => {
    if (responseComplete) {
      // exit without confirming - there is no state to save
      reset()
      onClose()
    } else {
      // open confirmation dialog
      setIsClosingSurvey(true)
    }
  }

  const handleCancelCloseRequest = () => {
    setIsClosingSurvey(false)
  }

  const submitResponse = async (event?: any) => {
    event?.preventDefault()
    setIsSubmitButtonDisabled(true)
    const completed_response: Partial<FormResponse> = {
      form_id: formId,
      participant_id: user.participant.id,
      responses: responsesData,
      // if the form was submitted, the survey was complete, otherwise it was in progress
      is_complete: !!event,
      furthest_page: furthestPageCompleted
    }

    try {
      if (responsesId) {
        await app.service('form-responses').patch(responsesId, completed_response)
      } else {
        await app.service('form-responses').create(completed_response)
      }
      onSubmit && await onSubmit()
      setIsClosingSurvey(false)
      setIsSubmitButtonDisabled(false)
      reset()
      onClose()
      loadData()
    } catch (err: any) {
      setIsSubmitButtonDisabled(false)
      setError('An error occurred while submitting the form. Please try again.')
    }
  }

  return (
    <>
      {
        // When the survey is complete, edits are no longer possible. We don't need to confirm exit and save the state.
        !responseComplete &&
        <SurveyExitDialog open={isClosingSurvey} onSave={submitResponse} onClose={handleCancelCloseRequest} />
      }
      <Dialog
        open={open}
        scroll='paper'
        onClose={handleCloseRequest}
        slotProps={{
          paper: {
            component: 'form',
            // @ts-ignore
            noValidate: true,
            onSubmit: submitResponse,
            sx: {
              height: '100%',
              minWidth: '21rem'
            }
          }
        }}
      >
        <DialogTitle component='div'>
          {
            currentPageNum === 0
              ? <Typography variant='h4' component='h1' sx={{ mb: 2, flex: '1 1' }}>
                {survey.title}
              </Typography>
              :
              <Typography variant='secondarySurveyTitle' component='h1' sx={{ mb: 2, flex: '1 1', opacity: 0.7 }}>
                {survey.secondaryTitle || survey.title}
              </Typography>
          }
          <LinearProgress
            variant='determinate'
            value={completedAmount}
            sx={{ flex: '0 0 100%' }}
          />
        </DialogTitle>
        <DialogContent>
          <div id='survey-top' aria-hidden={true} />
          <Survey disabled={responseComplete} />
          <FormError
            id='registry-consent-form'
            error={error} onClose={() => setError('')}
            sx={{ mt: 0, position: 'unset' }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-end', md: 'baseline' },
            px: 2,
          }}>
          <SurveyNav onClose={handleCloseRequest} isReadOnly={responseComplete} isSubmitting={isSubmitButtonDisabled} />
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SurveyDialog
