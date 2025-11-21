import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import Progress from 'PORTAL/components/basicComponents/progress'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import { InviteValidatorProvider } from 'PORTAL/contexts/useInviteValidator'

const PublicRoutes = () => {
  const { isAuthed, isAuthLoading } = useContext(AuthContext) as AuthContextType

  if (isAuthLoading) {
    return <Progress />
  }

  if (isAuthed) {
    return <Navigate to='/home' />
  }

  return (
    <InviteValidatorProvider>
      <Outlet />
    </InviteValidatorProvider>
  )
}

export default PublicRoutes
