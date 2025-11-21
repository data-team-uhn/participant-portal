import React, { useEffect, useState } from 'react'

import get from 'lodash/get'
import { map } from 'lodash'
import moment from 'moment'

import EmailIcon from '@mui/icons-material/Email'
import InfoIcon from '@mui/icons-material/Info'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import Progress from 'PORTAL/components/basicComponents/progress'
import SurveyDialog from 'PORTAL/components/surveys/surveyDialog'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import Header from 'PORTAL/components/header'
import NoStudyFound from 'PORTAL/components/noStudyFound'
import StudyChips from 'PORTAL/components/studyChips'
import { SurveyProvider } from 'PORTAL/contexts/surveyContext'
import app from 'PORTAL/feathers-client'

const StudyDetails = (props: { study_id: string }) => {

  const { study_id } = props

  const [study, setStudy] = useState(null)
  const [consentForm, setConsentForm] = useState(null)
  const [consentResponse, setConsentResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConsentDialog, setShowConsentDialog] = useState(false)

  const loadData = async() => {
    setIsLoading(true)
    try {
      const [fetchedStudy, fetchedConsentForm] = await Promise.all([
        app.service('studies').get(study_id),
        // Fetch the latest consent form for the study
        // For now, the UI only supports one consent form per study

        app.service('forms').find({
          query: {
            study_id: study_id,
            name: 'consent',
            $limit: 1,
            $sort: { version: -1 }
          }
        })
      ])

      const defaultForm = get(fetchedConsentForm, 'data[0]', null)
      setConsentForm(defaultForm)
      setStudy(fetchedStudy)

      if (defaultForm) {
        const fetchedConsentResponse = await app.service('form-responses').find({
          query: {
            form_id: defaultForm.id
          }
        })
        setConsentResponse(get(fetchedConsentResponse, 'data[0]', null))
      }
    } catch (error) {
      //we want to supress this error to display the 'no study found' page instead of an error
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const renderConsentComplete = () => {
    const date = moment(get(consentResponse, 'created_at')).format('YYYY-MM-DD')

    return (
      <>
        <Typography sx={{ mb: 2 }}>
          <FormattedMessage id='study.sentOn' values={{ date }}>
            Your consent form was sent on <strong>{date}</strong>
          </FormattedMessage>
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <FormattedMessage
            id='study.viewHere'
            defaultMessage='Your signed e-Consent is available to view here. As you have already given consent, you cannot change your answers through this form.' />
        </Typography>
        <Button sx={{ mb: 2 }} variant='contained' onClick={() => setShowConsentDialog(true)}>
          <Typography>
            View Signed Consent
          </Typography>
        </Button>
      </>
    )
  }

  const renderConsentSubmit = () => (
    <>
      <Typography sx={{ mb: 2 }}>
        You haven't consented to this study.
      </Typography>
      <Typography sx={{ mb: 2 }}>
        To view & submit the consent form, click the button below.
      </Typography>
      <Button sx={{ mb: 2 }} variant='contained' onClick={() => setShowConsentDialog(true)}>
        <Typography>
          View Consent Form
        </Typography>
      </Button>
    </>
  )

  const renderStudyDescription = () => {
    const lines = study.description.split('\n').filter(line => line.trim() !== '')
    const description = map(lines, (line, index) => (
      <Typography key={index} sx={{ mb: 1 }}>
        {line}
      </Typography>
    ))

    return (
      <Box
        sx={{
          borderRadius: 4,
          border: '0.75px solid grey',
          backgroundColor: 'white',
          padding: 2
        }}
      >
        <Typography variant='h6' component='h3' sx={{ mb: 2, color: 'secondary.main' }}>
          <FormattedMessage id='study.studyDescription' defaultMessage='Study Description' />
        </Typography>
        {description}
      </Box>
    )
  }

  const renderStudyParticipation = () => {
    const formData = get(consentForm, 'form', {})
    const formId = get(consentForm, 'id', '')

    if (!formId) {
      // If there is no consent form, we cannot render the participation section
      return null
    }

    return (
      <Box
        sx={{
          border: '0.75px solid grey',
          borderRadius: 4,
          backgroundColor: 'white',
          padding: 2
        }}
      >
        <Typography variant='h6' component='h3' sx={{ mb: 2, color: 'secondary.main' }}>
          <FormattedMessage id='study.myParticipation' defaultMessage='My Participation' />
        </Typography>
        {consentResponse?.is_complete ? renderConsentComplete() : renderConsentSubmit()}
        <SurveyProvider
          form={formData}
          formId={formId}
          formResponses={consentResponse}
        >
          <SurveyDialog
            open={showConsentDialog}
            onClose={() => setShowConsentDialog(false)}
            loadData={loadData}
          />
        </SurveyProvider>
      </Box>
    )
  }

  const renderStudyWithdraw = () => {
    const contact = [
      {
        type: 'phone',
        icon: <LocalPhoneIcon color='inherit' />,
        value: '555-555-5555 x1234',
        href: 'tel:5555555555x1234'
      },
      {
        type: 'email',
        icon: <EmailIcon color='inherit' />,
        value: 'test@test.com',
        href: 'mailto:test@test.com'
      }
    ]

    return (
      <Box
        sx={{
          border: '0.75px solid grey',
          borderRadius: 4,
          backgroundColor: 'white',
          padding: 2
        }}
      >
        <Typography variant='h6' component='h3' sx={{ mb: 2, color: 'secondary.main' }}>
          <FormattedMessage id='study.withdrawFromStudy' defaultMessage='Withdraw from Study' />
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <FormattedMessage
            id='study.withdraw'
            defaultMessage='In order to withdraw from this study, you must contact the study coordinator' />
        </Typography>
        {/* TODO: Link principal investigator to study and add this information dynamically */}
        <Typography color='secondary'>
          Dr. Mary Smith
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <em>Principal Investigator</em>
        </Typography>
        <List>
          {map(contact, (item, index) => {
            return (
              <ListItemButton
                key={index}
                sx={{ color: 'secondary.main', mb: 1 }}
                component='a'
                href={item.href}
                target='_blank'
                rel='noopener noreferrer'
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: '2em' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText>
                  {item.value}
                </ListItemText>
              </ListItemButton>
            )
          })}
        </List>
      </Box>
    )
  }

  if (isLoading) {
    return <Progress />
  }

  if (!study) {
    return <NoStudyFound />
  }

  return (
    <>
      <Header breadcrumbsTitle={study.title} pageTitle={study.title}>
        <Typography sx={{ mb: 3, mt: 1, lineHeight: '150%' }}>
          <span>
            <FormattedMessage
              values={{ 'id': study.external_study_id }} id='study.studyId'
              defaultMessage={`Study ID: ${study.external_study_id}`} />
            &emsp;
            <InfoIcon color='secondary' sx={{ verticalAlign: 'bottom' }} />
          </span>
        </Typography>
        <StudyChips studyData={study} />
      </Header>
      <Grid container spacing={3} sx={{ width: '100%', maxWidth: '90rem', margin: 'auto', padding: 2 }}>
        <Grid size={{ sm: 12, lg: 8 }}>
          {renderStudyDescription()}
        </Grid>
        <Grid size={{ sm: 12, lg: 4 }}>
          <Stack spacing={3}>
            {renderStudyParticipation()}
            {renderStudyWithdraw()}
          </Stack>
        </Grid>
      </Grid>
    </>
  )
}

export default StudyDetails
