import React from 'react'

import Box from '@mui/material/Box'

import AllResponsesTable from 'PORTAL/components/tables/consents/allResponsesTable'
import PortalMain from 'PORTAL/components/basicComponents/portalMain'
import SimpleHeader from 'PORTAL/components/basicComponents/simpleHeader'

export default function CoordinatorsAdminView() {

  return (
    <PortalMain>
      <SimpleHeader titleId='nav.participantData' title='Participant Data' id='participant-data' sx={{ maxWidth: '90rem' }} />
      <Box component='section' aria-labelledby='participant-data' sx={{ maxWidth: '90rem', margin: 'auto' }}>
        <AllResponsesTable />
      </Box>
    </PortalMain>
  )
}
