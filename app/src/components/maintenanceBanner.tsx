import React, { useContext } from 'react'

import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

import { AuthContext, type AuthContextType } from 'PORTAL/contexts/auth'
import { useAdminControls } from 'PORTAL/contexts/useAdminControls'
import { MAINTENANCE_BANNER_ID, RoleEnum } from 'PORTAL/constants'

const MaintenanceBanner = () => {
  const { isMaintenanceBannerOn, maintenanceBannerMessage } = useAdminControls()
  const { user } = useContext(AuthContext) as AuthContextType

  const isAdmin = user && user.role === RoleEnum.ADMIN

  if (!isMaintenanceBannerOn || isAdmin) {
    return null
  }

  return (
    <Box
      id={MAINTENANCE_BANNER_ID}
      sx={{
        display: 'block',
        zIndex: theme => theme.zIndex.drawer + 100,
        touchAction: 'none',
        width: '100%',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <Alert severity='warning' sx={{ width: '100%' }}>{maintenanceBannerMessage}</Alert>
    </Box>
  )
}

export default MaintenanceBanner
