import Box from '@mui/material/Box'
import React, { useState, useCallback, useEffect } from 'react'

import PortalMain from 'PORTAL/components/basicComponents/portalMain'
import Progress from 'PORTAL/components/basicComponents/progress'
import app from 'PORTAL/feathers-client'
import Typography from 'PORTAL/components/basicComponents/typography'
import InvitationsTable from 'PORTAL/components/tables/invitations/invitationsTable'
import { StudyType } from 'PORTAL/declarations'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

export default function Invitations() {

  const [isLoading, setIsLoading] = useState(true)
  const [study, setStudy] = useState<StudyType>(null)

  /**
   * Get the study id for the connect registry.
   * When there are multiple studies, the id will probably be passed as a prop so this may not be necessary
   */
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const connectStudy = await app.service('studies').find({
        query: {
          external_study_id: REGISTRY_EXTERNAL_ID,
          $limit: 1
        }
      })
      setStudy(connectStudy.data[0])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  return (
    <PortalMain>
      {isLoading ? <Progress /> :
        <Box component='section' aria-labelledby='invitations' sx={{ maxWidth: '90rem', margin: 'auto' }}>
          <Typography
            id='invitations'
            variant='h4'
            component='h1'
            messageId='nav.invitations'
            defaultMessage='Invitations'
            sx={{ mb: 1 }}
          />
          <Typography
            messageId='invitations.manageParticipant'
            defaultMessage='Manage participant invitations to the Connect Portal'
            sx={{ opacity: 0.7 }}
          />
          <InvitationsTable study_id={study.id}/>
        </Box>
      }
    </PortalMain>
  )
}
