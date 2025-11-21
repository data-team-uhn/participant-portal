import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'

import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'

import Button from 'PORTAL/components/basicComponents/button'
import DashboardCard from 'PORTAL/components/dashboardCard'
import EmptyCard from 'PORTAL/components/basicComponents/emptyCard'
import PortalMain from 'PORTAL/components/basicComponents/portalMain'
import Progress from 'PORTAL/components/basicComponents/progress'
import ParticipantWelcome from 'PORTAL/components/participantWelcome'
import RegistryConsentNoticeDialog from 'PORTAL/components/registryConsentNotice'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import type { ModulesType } from 'PORTAL/declarations'
import app from 'PORTAL/feathers-client'
import isOnMobile from 'PORTAL/hooks/isOnMobile'
import clapping from 'PORTAL/images/clapping.png'

export default function ParticipantDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [modules, setModules] = useState<ModulesType[]>([])
  const [moduleType, setModuleType] = useState<'consent' | 'module' | null>(null)
  const { registryConsentPopupOpen, setRegistryConsentPopupOpen } = useContext(AuthContext) as AuthContextType

  const onMobile = isOnMobile()
  const navigate = useNavigate()

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const modulesResponse = await app.service('modules').get()
      setModules(modulesResponse.data)
      setModuleType(modulesResponse.type)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  const handleCloseConsent = async () => {
    await loadData()
    setRegistryConsentPopupOpen(false)
  }

  // Placeholder for handling errors retrieving registry consent study or form, if needed
  const handleConsentError = (error: Error) => {
    setRegistryConsentPopupOpen(false)
  }

  const handleCloseModule = async () => {
    await loadData()
  }

  const hasContent = !isLoading && !isEmpty(modules)

  if (moduleType === 'consent' && onMobile) {
    return (
      <PortalMain bgcolor={'common.white'}>
        <RegistryConsentNoticeDialog
          open={registryConsentPopupOpen}
          onClose={handleCloseConsent}
          onError={handleConsentError}
        />
        <Box
          component='section'
          aria-label='welcome'
          sx={{
            height: '100%',
            maxWidth: '45rem',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 1
          }}>
          <ParticipantWelcome modules={modules} onSurveyClose={loadData} />
        </Box>
      </PortalMain>
    )
  }

  return (
    <PortalMain bgcolor={hasContent ? 'common.inputBackground' : 'common.white'}>
      <RegistryConsentNoticeDialog
        open={registryConsentPopupOpen}
        onClose={handleCloseConsent}
        onError={handleConsentError}
      />
      <Box component='section' aria-label='survey tasks' sx={{ maxWidth: '45rem', margin: 'auto' }}>
        {
          isLoading
            ? <Progress />
            : !hasContent
              ? <EmptyCard
                img={clapping}
                headerId='dashboard.emptyTitle'
                headerMessage={'You\'ve completed all the modules!'}
                bodyId='dashboard.empty'
                bodyMessage='Thank you for your contributions.'
                actions={
                  <Button
                    sx={{ mt: 4 }}
                    variant='outlinedGreyscale'
                    labelId='actions.reviewResponses'
                    defaultLabel='Review responses'
                    onClick={() => navigate('/responses')}
                  />
                }
              />
              : compact(map(modules, studyModule => (
                <DashboardCard key={studyModule.id} studyModules={studyModule} onClose={handleCloseModule} />
              )))
        }
      </Box>
    </PortalMain>
  )
}
