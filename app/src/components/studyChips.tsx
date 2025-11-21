import React from 'react'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'


import FormattedMessage from 'PORTAL/components/formattedMessage'
import { translateString } from 'PORTAL/utils'

const StudyChips = (props) => {

  const { studyData } = props

  const recruitmentStatus = () => {
    switch (studyData.stage) {
      case 'recruiting':
        return translateString('study.tags.recruitment.recruiting', 'Recruiting')
      case 'active':
        return translateString('study.tags.recruitment.active', 'Active - Not Recruiting')
      case 'invitation':
        return translateString('study.tags.recruitment.invitation', 'Enrolling by Invitation')
      case 'withdrawn':
        return translateString('study.tags.recruitment.withdrawn', 'Recruitment Withdrawn')
      case 'completed':
        return translateString('study.tags.recruitment.completed', 'Recruitment Completed')
      case 'hold':
        return translateString('study.tags.recruitment.hold', 'Recruitment on Hold')
    }
  }

  const studyPhase = () => {
    switch (studyData.phase) {
      case '0':
        return translateString('study.tags.phase.zero', 'Zero')
      case '1':
        return 'I'
      case '2':
        return 'II'
      case '3':
        return 'III'
      case '4':
        return 'IV'
      default:
        return translateString('study.tags.phase.notApplicable', 'N/A')
    }
  }

  const studyType = () => {
    switch (studyData.type) {
      case 'observational':
        return translateString('study.tags.type.observational', 'Observational Study')
      case 'interventional':
        return translateString('study.tags.type.interventional', 'Interventional Study')
      case 'expanded':
        return translateString('study.tags.type.expanded', 'Expanded Access Study')
      case 'registry':
        return translateString('study.tags.type.registry', 'Registry Study')
      default:
        return translateString('study.tags.type.unknown', 'Unknown Study Type')
    }
  }

  return (
    <>
      <Chip
        sx={{
          backgroundColor: theme => theme.statusColours.blue.background,
          color: theme => theme.statusColours.blue.text,
          mr: 1,
          mt: 1
        }}
        //icon={<InfoIcon color='secondary' />} TODO: add info message with this icon
        label={<Typography>{recruitmentStatus()}</Typography>}
      />
      <Chip
        sx={{
          backgroundColor: theme => theme.statusColours.pink.background,
          color: theme => theme.statusColours.pink.text,
          mr: 1,
          mt: 1
        }}
        //icon={<InfoIcon color='secondary' />} TODO: add info message with this icon
        label={
          <Typography>
            <FormattedMessage
              values={{ 'phase': studyPhase() }} id='study.tags.phase.studyPhase'
              defaultMesasge={`Study Phase: ${studyPhase()}`} />
          </Typography>
        }
      />
      <Chip
        sx={{
          backgroundColor: theme => theme.statusColours.green.background,
          color: theme => theme.statusColours.green.text,
          mt: 1
        }}
        //icon={<InfoIcon color='secondary' />} TODO: add info message with this icon
        label={<Typography>{studyType()}</Typography>}
      />
    </>
  )

}

export default StudyChips 
