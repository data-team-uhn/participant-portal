import React from 'react'

import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'

import Button from 'PORTAL/components/basicComponents/button'
import Typography from 'PORTAL/components/basicComponents/typography'
import VersionSelector from 'PORTAL/components/basicComponents/versionSelector'
import { DASHBOARD_CARD_CONTENT_MAPPING, ADMIN_CONTACT } from 'PORTAL/constants'
import { useSurvey } from 'PORTAL/contexts/surveyContext'
import { type ModulesType } from 'PORTAL/declarations'
import isOnMobile from 'PORTAL/hooks/isOnMobile'
import { getCardContent, translateString } from 'PORTAL/utils'

interface Props {
  studyModules: ModulesType[]
  isComplete: boolean | null
  selectedVersion: number | null
  setSelectedVersion: (version: number) => void
  onSurveyOpen: () => void
  date?: string
  showWithdrawIfComplete: boolean
}

const DashboardCardContent = ({
  studyModules,
  isComplete,
  selectedVersion,
  setSelectedVersion,
  onSurveyOpen,
  date,
  showWithdrawIfComplete
}: Props) => {
  const onMobile = isOnMobile()
  const { questionCount } = useSurvey()

  const BUTTON_TEXT = isComplete === null
    ? translateString('actions.start', 'Start')
    : isComplete
      ? translateString('actions.review', 'Review')
      : translateString('actions.continue', 'Continue')

  const moduleName = studyModules[0]!.name as keyof typeof DASHBOARD_CARD_CONTENT_MAPPING
  const cardContent = getCardContent(moduleName, isComplete)

  return (
    <CardContent sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant='cardType'
          component='span'
          messageId={cardContent.typeId}
          defaultMessage={cardContent.typeMessage}
          sx={{ mb: 1, display: { xs: 'none', md: 'block' } }}
        />
        <Box aria-hidden={!onMobile} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            component='img'
            src={cardContent.image}
            alt=''
            sx={{ height: '5.438rem' }}
          />
          <Typography
            variant='h5'
            component='h1'
            messageId={cardContent.title.messageId}
            defaultMessage={cardContent.title.defaultMessage}
          />
        </Box>
        <Typography
          variant='h5'
          component='h1'
          messageId={cardContent.title.messageId}
          defaultMessage={cardContent.title.defaultMessage}
          aria-hidden={onMobile}
          sx={{ mb: 1, display: { xs: 'none', md: 'block' } }}
        />
        <Typography
          messageId={cardContent.subtitle.messageId}
          defaultMessage={cardContent.subtitle.defaultMessage}
          sx={{ mb: 2 }}
        />
        {
          showWithdrawIfComplete && isComplete &&
          <Typography
            messageId='consents.withdraw'
            defaultMessage='If you wish to withdraw from the study at any time, please contact the study coordinator at <1>{{values}}</1>.'
            values={{ admin_contact: ADMIN_CONTACT }}
            sx={{ mb: 2 }}
            fontWeight='bold'
            color='error'
          >
            If you wish to withdraw from the study at any time, please contact the study coordinator at 
            <Link color='error' href={`mailto:${ADMIN_CONTACT}`} target='_blank' rel='noopener noreferrer'>
              {ADMIN_CONTACT}
            </Link>
          </Typography>
        }
        {!onMobile && (date
          ? (
            <Typography
              messageId='dashboard.cards.lastUpdatedResponse'
              values={{ date }}
              variant='caption'
              sx={{ mb: 2, display: 'block', width: '100%', opacity: 0.7 }}
            >
              Updated on <strong>{date}</strong>
            </Typography>
          )
          : (
            <Typography
              messageId='dashboard.cards.notStarted'
              defaultMessage='Not yet started'
              variant='caption'
              sx={{ mb: 2, display: 'block', width: '100%', opacity: 0.7 }} />
          ))
        }

        <Button
          sx={{ mb: 0 }}
          variant='contained'
          onClick={onSurveyOpen}
        >
          {BUTTON_TEXT}
        </Button>
        <Typography
          messageId='dashboard.cards.questions'
          values={{ questionCount }}
          variant='footer'
          component='span'
          sx={{
            ml: 2,
            display: { xs: 'none', md: 'inline-flex' },
            alignItems: 'center',
            opacity: 0.7
          }}
        >
          {questionCount} questions
        </Typography>
        {date && onMobile &&
          <Typography
            messageId='dashboard.cards.lastUpdatedResponse'
            values={{ date }}
            variant='caption'
            sx={{ mt: 2, display: 'block', width: '100%', opacity: 0.7 }}
          >
            Updated on <strong>{date}</strong>
          </Typography>
        }
        {/* TODO: Add in version selector when need for it and designs are ready*/}
        {/*<VersionSelector*/}
        {/*  studyModules={studyModules}*/}
        {/*  selectedVersion={selectedVersion}*/}
        {/*  onVersionChange={setSelectedVersion}*/}
        {/*/>*/}
      </Box>
      <Box
        component='img'
        src={cardContent.image}
        alt=''
        sx={{
          display: { xs: 'none', md: 'block' },
          alignSelf: 'flex-end',
          height: '8.125rem',
          flexShrink: 0
        }}
        aria-hidden={onMobile}
      />
    </CardContent>
  )
}

export default DashboardCardContent
