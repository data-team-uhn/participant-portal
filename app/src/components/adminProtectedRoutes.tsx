import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import Progress from 'PORTAL/components/basicComponents/progress'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import { RoleEnum } from 'PORTAL/constants'

const AdminProtectedRoutes = () => {
  const { isAuthed, isAuthLoading, user } = useContext(AuthContext) as AuthContextType

  if (isAuthLoading) {
    return <Progress />
  }

  return isAuthed ? (user.role === RoleEnum.ADMIN ? <Outlet/> : <Navigate to='/home'/>) : <Navigate to='/login' />
}

export default AdminProtectedRoutes
