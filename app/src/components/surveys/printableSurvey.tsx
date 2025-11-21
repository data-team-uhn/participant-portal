import React from 'react'

import flatMap from 'lodash/flatMap'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import SurveyComponent from 'PORTAL/components/surveys/surveyComponent'
import { useSurvey } from 'PORTAL/contexts/surveyContext'

import type { SurveyComponentType } from 'PORTAL/declarations'

const PrintableSurvey = () => {
  const { survey, responsesData, handleQuestionResponse } = useSurvey()

  const contentGroupedByHeader = groupBy(survey.pages, (page) => page.title)

  return (
    <Box
      sx={{
        color: 'text.primary',
        width: 'auto',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
      <Typography variant='h4' component='h1' sx={{ mb: 3 }}>
        {survey.title}
      </Typography>
      {
        map(contentGroupedByHeader, (pagedContent, header) => {
          return (
            <Box
              key={`printing_${header}`}
              sx={{
                mb: 3,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
                pageBreakAfter: 'auto',
              }}
            >
              <Typography variant='h5' component='h2' sx={{ mb: 3 }}>
                {header}
              </Typography>
              {
                flatMap(pagedContent, (content, index) =>
                  map(content?.components ?? [], (component: SurveyComponentType, componentIndex: number) => {
                    return (
                      <Box
                        key={`component_${header}_${index}_${componentIndex}`}
                        sx={{
                          mb: 1.5,
                          breakInside: 'avoid',
                          pageBreakInside: 'avoid',
                          pageBreakAfter: 'auto',
                        }}
                      >
                      <SurveyComponent
                        key={`printing_component_${header}_${index}_${componentIndex}`}
                        component={component}
                        isPrinting={true}
                        responses={responsesData}
                        onResponse={handleQuestionResponse}
                      />
                      </Box>
                    )
                  }))
              }
            </Box>
          )
        })
      }
    </Box>
  )
}

export default PrintableSurvey
