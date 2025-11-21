import React, { useRef, useState } from 'react'

import map from 'lodash/map'
import moment from 'moment'
import { useReactToPrint } from 'react-to-print'

import PrintIcon from '@mui/icons-material/Print'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'

import PrintableSurvey from 'PORTAL/components/surveys/printableSurvey'
import SurveyComponent from 'PORTAL/components/surveys/surveyComponent'
import { useSurvey } from 'PORTAL/contexts/surveyContext'

import type { SurveyComponentType } from 'PORTAL/declarations'
import Typography from 'PORTAL/components/basicComponents/typography'
import { ADMIN_CONTACT } from 'PORTAL/constants'

type SurveyPropsType = { disabled?: boolean }

const Survey: React.FC<SurveyPropsType> = (props: SurveyPropsType) => {
  const { disabled = false } = props
  const [printOpen, setPrintOpen] = useState(false)
  const { survey, currentPageNum, responsesData, handleQuestionResponse, responseComplete, isLastPage } = useSurvey()
  const contentRef = useRef<HTMLDivElement | null>(null)

  const page = survey.pages[currentPageNum]
  const handlePrint = useReactToPrint({
    contentRef,
    onPrintError: (error) => console.log(error),
    preserveAfterPrint: true,
    pageStyle: '@page { margin: 1in;  size: A4 portrait }',
    documentTitle: `${survey.title}_signed_consent_${moment().format('YYYY-MM-DD')}.pdf`,
    onBeforePrint: () => {
      setPrintOpen(true)
      return Promise.resolve()
    },
    onAfterPrint: () => {
      setPrintOpen(false)
    },
  })

  return (
    <>
      <Box sx={{ maxWidth: '45rem', margin: 'auto' }}>
        {
          // If the survey is disabled, we allow users to print their completed survey
          disabled && (
            <IconButton
              aria-label='print'
              onClick={handlePrint}
              sx={{
                color: (theme) => theme.palette.grey[500],
                float: 'right'
              }}
            >
              <PrintIcon />
            </IconButton>
          )
        }
        {
          page?.title && (
            <Typography variant='h5' component='h2' sx={{ mb: 3, clear: 'right' }}>
              {page.title}
            </Typography>
          )
        }
        {
          map(page?.components ?? [], (component: SurveyComponentType, index: number) =>
            <SurveyComponent
              key={`page_${currentPageNum}_component_${index}`}
              component={component}
              disabled={disabled}
              responses={responsesData}
              onResponse={handleQuestionResponse}
            />
          )
        }
        {
          isLastPage && responseComplete && survey.showWithdrawIfComplete &&
          <Typography
            align='center'
            messageId='consents.withdraw'
            defaultMessage='If you wish to withdraw from the study at any time, please contact the study coordinator at <1>{{values}}</1>.'
            values={{ admin_contact: ADMIN_CONTACT }}
            sx={{ maxWidth: '45rem', margin: 'auto' }}
            fontWeight='bold'
            color='error'
          >
            If you wish to withdraw from the study at any time, please contact the study coordinator at 
            <Link color='error' href={`mailto:${ADMIN_CONTACT}`} target='_blank' rel='noopener noreferrer'>
              {ADMIN_CONTACT}
            </Link>
          </Typography>
        }
      </Box>
      {disabled && printOpen && (
        <Box
          aria-hidden='true'
          ref={contentRef}
          sx={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            visibility: 'hidden',
            overflow: 'hidden',
            '@media print': {
              position: 'static',
              left: 0,
              top: 0,
              width: 'auto',
              height: 'auto',
              visibility: 'visible',
              overflow: 'visible',
            },
          }}
        >
          <PrintableSurvey />
        </Box>
      )}
    </>
  )
}

export default Survey
