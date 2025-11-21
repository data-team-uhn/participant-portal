import React, { useState } from 'react'

import Card, { type CardProps } from '@mui/material/Card'

import find from 'lodash/find'
import isArray from 'lodash/isArray'
import last from 'lodash/last'
import moment from 'moment'

import DashboardCardContent from 'PORTAL/components/dashboardCardContent'
import SurveyDialog from 'PORTAL/components/surveys/surveyDialog'
import { SurveyProvider } from 'PORTAL/contexts/surveyContext'
import type { ModulesType } from 'PORTAL/declarations'

interface Props extends CardProps {
  studyModules: ModulesType | ModulesType[]
  onClose?: () => Promise<void>
}

const DashboardCard = ({ studyModules, onClose, ...rest }: Props) => {
  // Force into array for easier handling and return null if not a valid module
  if (!isArray(studyModules)) {
    studyModules = [studyModules]
  }

  // Handle version selection
  const hasSingleVersion = studyModules.length === 1
  const highestVersion = last(studyModules)
  const lastUpdated = highestVersion?.form_responses?.last_updated_at
  const date = lastUpdated && moment(lastUpdated).format('MMMM Do YYYY [at] h:mm a')

  // Assumes sorting happens in the module-responses service - default selected is set to most recently updated.
  const [selectedVersion, setSelectedVersion] = useState(highestVersion?.version || null)
  const [surveyOpen, setSurveyOpen] = useState(false)

  const selectedModule = (hasSingleVersion
    ? studyModules[0]
    : find(studyModules, { version: selectedVersion })) as ModulesType
  const { form_responses, ...form } = selectedModule

  const handleOpen = () => setSurveyOpen(true)

  const handleClose = async () => {
    onClose && (await onClose())
    setSurveyOpen(false)
  }

  if (!selectedVersion) {
    return null
  }

  return (
    <SurveyProvider form={form?.form} formId={form?.id} formResponses={form_responses || {}}>
      <SurveyDialog open={!!selectedVersion && surveyOpen} onClose={handleClose} />
      <Card
        elevation={0} {...rest}
        sx={{ display: 'flex', flexDirection: 'column', my: 2, borderRadius: 2, ...rest.sx }}
      >
        <DashboardCardContent
          studyModules={studyModules}
          isComplete={form_responses.is_complete}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          onSurveyOpen={handleOpen}
          date={date}
          showWithdrawIfComplete={highestVersion.form.showWithdrawIfComplete}
        />
      </Card>
    </SurveyProvider>
  )
}

export default DashboardCard
