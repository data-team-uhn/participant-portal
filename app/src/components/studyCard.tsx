import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import InfoIcon from '@mui/icons-material/Info'
import Typography from '@mui/material/Typography'

import StudyChips from 'PORTAL/components/studyChips'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import { AuthContext, type AuthContextType } from 'PORTAL/contexts/auth'
import { translateString } from 'PORTAL/utils'
import { RoleEnum } from 'PORTAL/constants'

const StudyCard = (props) => {
  const {
    studyData
  } = props

  const { user } = useContext(AuthContext) as AuthContextType
  const navigate = useNavigate()

  const isParticipant = user.role === RoleEnum.PARTICIPANT

  return (
    <Card
      component="section"
      aria-labelledby={studyData.id}
      sx={{ 
        border: '0.75px solid grey',
        borderRadius: 4,
        mx: 'auto',
        my: 2,
        width: '100%',
        display: 'block',
        height: 'min-content'
      }}
    >
      {/* TODO: header is in a placeholder state. It needs translation and to handle colours better. */}
      {isParticipant &&
        <CardHeader
          title={studyData.status}
          slotProps={{
            title: {
              component: 'span',
              variant: 'body1'
            }
          }}
          sx={{
            backgroundColor: theme => studyData.status === 'Enrolled' ? theme.statusColours.green.background : theme.statusColours.blue.background,
            color: theme => studyData.status === 'Enrolled' ? theme.statusColours.green.text : theme.statusColours.blue.text,
            px: 2,
            py: 1
          }}
        >
        </CardHeader>
      }
      <CardContent sx={{ py: 2, pb: 0 }}>
      <Box 
        aria-label='study attributes'
        sx={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2
        }}
      >
        <StudyChips studyData={studyData}/>
      </Box>
      <Typography id={studyData.id} variant={'h6'} component={'h2'} sx={{ mb: 1 }}>
        {studyData.title}
      </Typography>
      <Typography sx={{ mb: 3, lineHeight: '150%' }}>
        <span>
          <FormattedMessage values={{ 'id': studyData.external_study_id }} id='study.studyId' defaultMessage={`Study ID: ${studyData.external_study_id}`} />
          &emsp;
          <InfoIcon color='secondary' sx={{ verticalAlign: 'bottom' }} />
        </span>
      </Typography>
      </CardContent>
      <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
      <Button variant='contained' sx={{width: '140px'}} onClick={() => navigate(`/study/${studyData.id}`)}>
        <Typography>
          {translateString('study.showDetails', "Show Details")}
        </Typography>
      </Button>
      </CardActions>
    </Card>
  )
}

export default StudyCard
