import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'

import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import ParticipantDashboard from 'PORTAL/components/participantDashboard'
import { RoleEnum } from 'PORTAL/constants'

export default function Dashboard() {
  const { user } = useContext(AuthContext) as AuthContextType

  const isParticipant = user.role === RoleEnum.PARTICIPANT

  if (isParticipant) {
    return <ParticipantDashboard />
  } else {
    return <Navigate to='/invitations' />
  }

}
