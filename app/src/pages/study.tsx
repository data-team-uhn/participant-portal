import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'

import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import StudyDetails from 'PORTAL/components/studyDetails'
import ManageStudy from 'PORTAL/components/manageStudy'
import { RoleEnum } from 'PORTAL/constants'

const Study = () => {

  const { user } = useContext(AuthContext) as AuthContextType

  const { studyId } = useParams()

  return(
    <>
      {
        user.role === RoleEnum.PARTICIPANT ? 
          <StudyDetails study_id={studyId}/> : 
          <ManageStudy study_id={studyId}/>
      }
    </>
  )
}

export default Study