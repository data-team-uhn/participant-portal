import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import Progress from 'PORTAL/components/basicComponents/progress'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'

const ProtectedRoutes = () => {
  const { isAuthed, isAuthLoading, user } = useContext(AuthContext) as AuthContextType

  if (isAuthLoading) {
    return <Progress />
  }

  if (!isAuthed || !user.isVerified) {
    return <Navigate to='/login' />
  }

  return <Outlet />
}

export default ProtectedRoutes
