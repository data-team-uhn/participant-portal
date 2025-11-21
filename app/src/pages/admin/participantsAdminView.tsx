import React from 'react'

import Box from '@mui/material/Box'

import SimpleHeader from 'PORTAL/components/basicComponents/simpleHeader'
import PortalMain from 'PORTAL/components/basicComponents/portalMain'
import ParticipantsTable from 'PORTAL/components/tables/participants/participantsTable'

export default function ParticipantsAdminView() {

  return (
    <PortalMain>
      <SimpleHeader titleId='nav.participants' title='Participants' id='participants' sx={{ maxWidth: '90rem' }} />
      <Box component='section' aria-labelledby='participants' sx={{ maxWidth: '90rem', margin: 'auto' }}>
        <ParticipantsTable />
      </Box>
    </PortalMain>
  )
}
