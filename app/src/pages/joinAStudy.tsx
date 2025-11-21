import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import app from 'PORTAL/feathers-client'
import Progress from 'PORTAL/components/basicComponents/progress'
import FormattedMessage from 'PORTAL/components/formattedMessage'

const JoinAStudy = () => {

  const navigate = useNavigate()
  const { studyLinkId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [study, setStudy] = useState(null)

  const loadStudy = async() => {
    const studies = await app.service('studies').find({ query: { linkId: studyLinkId }})
    if (studies.total > 0) setStudy(studies.data[0])
    setIsLoading(false)
  }

  useEffect(() => {
    loadStudy()
  }, [])

  const renderStudyFound = () => (
    <>
      <Typography variant='h6' component='h2' sx={{mb: 2}}>
        Welcome! You've been invited to join the following study: <strong>{study.title}</strong>
      </Typography>
      <Typography sx={{mb: 2}}>
        If you don't have a PCGL account, create one now by clicking the 'Create Account' button.
        Otherwise, continue to log in.
      </Typography>
        <Button
          variant='contained'
          size='large'
          onClick={() => navigate(`/register/${studyLinkId}`)}
          sx={{ display: 'block', my: 2, mx: 'auto', width: '80%' }}
        >
          <FormattedMessage id='register.createAccount' defaultMessage='Create Account' />
        </Button>
      <Button
        variant='outlined'
        size='large'
        onClick={() => navigate(`/login/${studyLinkId}`)}
        sx={{ display: 'block', my: 2, mx: 'auto', width: '80%' }}
      >
        <FormattedMessage id='login.logIn' defaultMessage='Log In' />
      </Button>
    </>
  )

  if (isLoading) {
    return <Progress />
  }

  /**
   * This is basically all a placeholder until we get updated designs / text - that's why none of the strings are translated
   */
  return (
    <>
      <Typography id='join-title' variant='h4' component='h1' sx={{ mb: 2 }}>
        Join Study in PCGL
      </Typography>
      {
        study ?
          renderStudyFound() :
          <>
            <Typography>We couldn't find a study associated with that link.</Typography>
            <Typography>Please double check the URL and try again.</Typography>
          </>
      }
    </>
  )
}

export default JoinAStudy
