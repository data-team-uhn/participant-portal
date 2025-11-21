import React from 'react'

import Box from '@mui/material/Box'

import SimpleHeader from 'PORTAL/components/basicComponents/simpleHeader'
import PortalMain from 'PORTAL/components/basicComponents/portalMain'
import CoordinatorsTable from 'PORTAL/components/tables/coordinators/coordinatorsTable'

export default function CoordinatorsAdminView() {

  return (
    <PortalMain>
      <SimpleHeader id='invitations' titleId='nav.coordinators' title='Coordinators' sx={{ maxWidth: '90rem' }} />
      <Box component='section' aria-labelledby='invitations' sx={{ maxWidth: '90rem', margin: 'auto' }}>
        <CoordinatorsTable />
      </Box>
    </PortalMain>
  )
}
