import React from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import FormattedMessage from 'PORTAL/components/formattedMessage'

const NoStudyFound = () => {

  const navigate = useNavigate()

  return (

    <Box component='section' sx={{ margin: 2 }}>
      <Box
        sx={{
          display: 'block',
          padding: 2,
          borderRadius: 4,
          backgroundColor: 'white',
          maxWidth: '1440px',
          margin: 'auto'
        }}
      >
        <Typography component='h1' variant='h4' sx={{margin: 1}}>
          <FormattedMessage id='study.studyNotFoundTitle' defaultMessage='Oops! The study you requested could not be found.'/>
        </Typography>
        <Typography sx={{margin: 1}}>
          <FormattedMessage id='study.studyNotFoundBody' defaultMessage='There was an error locating the selected study. Please return to the My Studies page and try again.'/>
        </Typography>
        <Button onClick={() => navigate('/home')} variant='contained' sx={{margin: 2}}>
          <Typography>
            <FormattedMessage id='study.returnToStudies' defaultMessage='Return to My Studies'/>
          </Typography>
        </Button>
      </Box>
    </Box>
  )
}

export default NoStudyFound